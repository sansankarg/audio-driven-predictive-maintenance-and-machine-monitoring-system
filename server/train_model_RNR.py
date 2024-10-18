import os
import numpy as np
import librosa
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from sklearn.model_selection import train_test_split

# Function to extract MFCCs
def extract_mfcc(file_path, n_mfcc=40, max_len=400):
    audio, sr = librosa.load(file_path)
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)

    if mfccs.shape[1] < max_len:
        pad_width = max_len - mfccs.shape[1]
        mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)), mode='constant')
    else:
        mfccs = mfccs[:, :max_len]

    return mfccs

# Function to calculate additional features
def average_amplitude(signal):
    return np.mean(np.abs(signal))

def calculate_rms(signal, frame_length=1024, hop_length=512):
    return np.mean(librosa.feature.rms(y=signal, frame_length=frame_length, hop_length=hop_length)[0])

def calculate_zcr(signal, frame_length=1024, hop_length=512):
    return np.mean(librosa.feature.zero_crossing_rate(y=signal, frame_length=frame_length, hop_length=hop_length)[0])

# Directory paths for healthy and faulty audio samples
healthy_dir = 'audio3/healthy/'
faulty_dir = 'audio3/faulty/'
notrunning_dir = 'audio3/silence/'

# Function to process audio files from a directory
def process_audio_files(directory, label):
    X = []
    Y = []
    for file_name in os.listdir(directory):
        file_path = os.path.join(directory, file_name)
        if file_name.endswith(('.wav', '.mp3')):  # Check for audio file extensions
            audio, sr = librosa.load(file_path)
            mfccs = extract_mfcc(file_path)  # Extract MFCCs

            # Calculate additional features
            amplitude_mean = average_amplitude(audio)
            rms_mean = calculate_rms(audio)
            zcr_mean = calculate_zcr(audio)

            # Reshape and repeat additional features to match the time frames of MFCCs
            additional_features = np.array([amplitude_mean, rms_mean, zcr_mean])
            additional_features = np.repeat(additional_features[:, np.newaxis], mfccs.shape[1], axis=1)

            # Concatenate MFCCs and additional features
            features = np.vstack([mfccs, additional_features])
            X.append(features)
            Y.append(label)  # 0 for healthy, 1 for faulty

    return np.array(X), np.array(Y)

# Load and process all healthy and faulty files
X_healthy, Y_healthy = process_audio_files(healthy_dir, 1)
X_faulty, Y_faulty = process_audio_files(faulty_dir, 1)
X_notrunning, Y_notrunning = process_audio_files(notrunning_dir, 0)

# Combine the datasets
X = np.concatenate([X_healthy, X_faulty, X_notrunning], axis=0)
Y = np.concatenate([Y_healthy, Y_faulty, Y_notrunning], axis=0)

# Reshape for CNN (add channel dimension for Conv2D)
X = X[..., np.newaxis]  # Shape becomes (num_samples, height, width, 1)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# Build CNN model
model = Sequential([
    Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(X_train.shape[1], X_train.shape[2], 1)),
    MaxPooling2D(pool_size=(2, 2)),

    Conv2D(64, kernel_size=(3, 3), activation='relu'),
    MaxPooling2D(pool_size=(2, 2)),

    Flatten(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')  # Binary classification output
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(X_train, y_train, epochs=20, batch_size=16, validation_data=(X_test, y_test))

# Evaluate the model
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test accuracy: {test_acc}")

# Save the model
model.save('Models/RNR6.keras')
