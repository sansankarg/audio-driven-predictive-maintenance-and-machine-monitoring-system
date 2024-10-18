import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

# Define the file paths for the three audio files
audio_files = ['../audio2/Faulty/slowed_1.wav', '../audio2/Healthy/normal_1.wav', '../audio2/Silence/notrunning_1.wav']

# Frame and hop length parameters
frame_size = 2048
hop_length = 512

# Create a figure for the subplots
plt.figure(figsize=(15, 10))

# Loop through the audio files and plot their RMS
for i, audio_file in enumerate(audio_files):
    # Load the audio file
    y, sr = librosa.load(audio_file, sr=None)

    # Compute the root mean square (RMS) energy
    rms = librosa.feature.rms(y=y, frame_length=frame_size, hop_length=hop_length)[0]

    # Create a time axis for the RMS plot
    frames = range(len(rms))
    t = librosa.frames_to_time(frames, sr=sr, hop_length=hop_length)

    # Create a subplot for each audio file
    plt.subplot(3, 1, i + 1)  # 3 rows, 1 column, i+1 is the subplot index
    plt.plot(t, rms, label='RMS Energy', color='g')
    plt.title(f'Root Mean Square (RMS) {i + 1}: {audio_file.split("/")[-1]}')
    plt.xlabel('Time (s)')
    plt.ylabel('RMS Energy')

# Adjust layout and show the plot
plt.tight_layout()

# Save the plot as a single image file
plt.savefig('rms_comparison.png')

# Display the plot
plt.show()
