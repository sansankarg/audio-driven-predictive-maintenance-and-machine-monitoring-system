import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

# Define the file paths for the three audio files
audio_files = ['../audio2/Faulty/slowed_1.wav', '../audio2/Healthy/normal_1.wav', '../audio2/Silence/notrunning_1.wav']

# Function to compute amplitude envelope
def amplitude_envelope(y, frame_size, hop_length):
    envelope = []
    for i in range(0, len(y), hop_length):
        frame = y[i:i+frame_size]
        envelope.append(np.max(np.abs(frame)))
    return np.array(envelope)

# Frame and hop length parameters
frame_size = 2048
hop_length = 512

# Create a figure for the subplots
plt.figure(figsize=(15, 10))

# Loop through the audio files and plot their amplitude envelopes
for i, audio_file in enumerate(audio_files):
    # Load the audio file
    y, sr = librosa.load(audio_file, sr=None)

    # Compute the amplitude envelope
    amp_env = amplitude_envelope(y, frame_size, hop_length)

    # Create a time axis for the amplitude envelope plot
    frames = range(len(amp_env))
    t = librosa.frames_to_time(frames, sr=sr, hop_length=hop_length)

    # Create a subplot for each audio file
    plt.subplot(3, 1, i + 1)  # 3 rows, 1 column, i+1 is the subplot index
    plt.plot(t, amp_env, label='Amplitude Envelope')
    plt.title(f'Amplitude Envelope {i + 1}: {audio_file.split("/")[-1]}')
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')

# Adjust layout and show the plot
plt.tight_layout()

# Save the plot as a single image file
plt.savefig('amplitude_envelopes_comparison.png')

# Display the plot
plt.show()
