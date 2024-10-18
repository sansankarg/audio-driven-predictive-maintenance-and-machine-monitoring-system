import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

# Define the file paths for the three audio files
audio_files = ['../audio2/Faulty/slowed_1.wav', '../audio2/Healthy/normal_1.wav', '../audio2/Silence/notrunning_1.wav']

# Create a figure for the subplots
plt.figure(figsize=(15, 10))

# Loop through the audio files and plot their Mel spectrograms
for i, audio_file in enumerate(audio_files):
    # Load the audio file
    y, sr = librosa.load(audio_file, sr=None)

    # Extract the Mel spectrogram
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=512, n_mels=128)

    # Convert power (amplitude squared) to decibels
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)

    # Create a subplot for each audio file
    plt.subplot(3, 1, i + 1)  # 3 rows, 1 column, i+1 is the subplot index
    librosa.display.specshow(mel_spectrogram_db, sr=sr, hop_length=512, x_axis='time', y_axis='mel')
    plt.colorbar(format='%+2.0f dB')
    plt.title(f'Mel Spectrogram {i + 1}: {audio_file.split("/")[-1]}')

# Adjust layout and show the plot
plt.tight_layout()

# Save the plot as a single image file
plt.savefig('mel_spectrograms_comparison.png')

# Display the plot
plt.show()
