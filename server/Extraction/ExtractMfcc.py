import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

# Define the file paths for the three audio files
audio_files = ['../audio2/Faulty/slowed_1.wav', '../audio2/Healthy/normal_1.wav', '../audio2/Silence/notrunning_1.wav']

# Create a figure for the subplots
plt.figure(figsize=(15, 10))

# Loop through the audio files and plot their MFCCs
for i, audio_file in enumerate(audio_files):
    # Load the audio file
    y, sr = librosa.load(audio_file, sr=None)

    # Extract the MFCCs (Mel-frequency cepstral coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

    # Convert MFCC data to a more displayable format
    mfccs_db = librosa.power_to_db(np.abs(mfccs))

    # Create a subplot for each audio file
    plt.subplot(3, 1, i + 1)  # 3 rows, 1 column, i+1 is the subplot index
    librosa.display.specshow(mfccs_db, sr=sr, x_axis='time')
    plt.colorbar(format='%+2.0f dB')
    plt.title(f'MFCC {i + 1}: {audio_file.split("/")[-1]}')

# Adjust layout and show the plot
plt.tight_layout()

# Save the plot as a single image file
plt.savefig('mfccs_comparison.png')

# Display the plot
plt.show()
