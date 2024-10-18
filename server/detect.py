import numpy as np
import librosa
import librosa.feature
import sounddevice as sd
from tensorflow.keras.models import load_model

model=load_model('trained_model.keras')

def extract_mfcc(file_path, n_mfcc=40, max_len=400):
    audio, sr = librosa.load(file_path)
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)

    if mfccs.shape[1] < max_len:
        pad_width = max_len - mfccs.shape[1]
        mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)), mode='constant')
    else:
        mfccs = mfccs[:, :max_len]

    return mfccs

def average_amplitude(signal):
    return np.mean(np.abs(signal))


def calculate_rms(signal, frame_length=1024, hop_length=512):
    return np.mean(librosa.feature.rms(y=signal, frame_length=frame_length, hop_length=hop_length)[0])


def calculate_zcr(signal, frame_length=1024, hop_length=512):
    return np.mean(librosa.feature.zero_crossing_rate(y=signal, frame_length=frame_length, hop_length=hop_length)[0])

def evaluate_audio(file_path):
    audio,sr=librosa.load(file_path)
    mfccs = extract_mfcc(file_path)  # MFCC shape: (n_mfcc, max_len)

    amplitude_mean = average_amplitude(audio)
    rms_mean = calculate_rms(audio)
    zcr_mean = calculate_zcr(audio)

    # Reshape additional features and repeat to match MFCC time frames
    additional_features = np.array([amplitude_mean, rms_mean, zcr_mean])
    additional_features = np.repeat(additional_features[:, np.newaxis], mfccs.shape[1], axis=1)

    # Concatenate MFCCs and additional features
    features = np.vstack([mfccs, additional_features])

    # Reshape for model input (add batch and channel dimensions)
    features = features[np.newaxis, ..., np.newaxis]  # shape: (1, n_mfcc + 3, max_len, 1)

    # Predict using the loaded model
    prediction = model.predict(features)

    # Interpret the result
    if prediction[0] > 0.5:
        print(f"The machine is FAULTY (confidence: {prediction[0][0] * 100:.2f}%)")
    else:
        print(f"The machine is HEALTHY (confidence: {(1 - prediction[0][0]) * 100:.2f}%)")

def evaluate_live_audio(duration=10,sr=22050):
    print("Record for 10sec")
    audio=sd.rec(int(duration*sr),samplerate=sr,channels=1,dtype='float32')
    sd.wait()
    audio=audio.flatten()

    mfccs=extract_mfcc(audio,sr)

    amplitude_mean=average_amplitude(audio)
    rms_mean=calculate_rms(audio)
    zcr_mean=calculate_zcr(audio)
    additional_features = np.array([amplitude_mean, rms_mean, zcr_mean])
    additional_features = np.repeat(additional_features[:, np.newaxis], mfccs.shape[1], axis=1)

    # Concatenate MFCCs and additional features
    features = np.vstack([mfccs, additional_features])

    # Reshape for model input (add batch and channel dimensions)
    features = features[np.newaxis, ..., np.newaxis]  # shape: (1, n_mfcc + 3, max_len, 1)

    # Predict using the loaded model
    prediction = model.predict(features)

    # Interpret the result
    if prediction[0] > 0.5:
        print(f"The machine is FAULTY (confidence: {prediction[0][0] * 100:.2f}%)")
    else:
        print(f"The machine is HEALTHY (confidence: {(1 - prediction[0][0]) * 100:.2f}%)")

evaluate_audio('audio/Healthy/Healthy_machine1.wav')
evaluate_audio('audio/Faulty/Fault_slowed_1.wav')