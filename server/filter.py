import librosa
import numpy as np
import matplotlib.pyplot as plt
import soundfile as sf

def spectral_subtraction(noisy_audio, clean_audio, sr):
    # Make sure both audio signals have the same length
    min_length = min(len(noisy_audio), len(clean_audio))
    noisy_audio = noisy_audio[:min_length]
    clean_audio = clean_audio[:min_length]

    # Convert audio to spectrogram (frequency domain)
    noisy_stft = librosa.stft(noisy_audio)
    clean_stft = librosa.stft(clean_audio)

    # Calculate noise profile
    noise_profile = np.mean(np.abs(noisy_stft - clean_stft), axis=1)

    # Subtract noise profile from noisy audio
    filtered_stft = noisy_stft - noise_profile[:, np.newaxis]

    # Convert back to time domain
    filtered_audio = librosa.istft(filtered_stft)
    return filtered_audio

# Load the audio data
noisy_audio, sr = librosa.load('audio2/Healthy/normal_1.wav', sr=None)
clean_audio, sr = librosa.load('wireless_audio.wav', sr=None)

# Perform spectral subtraction
filtered_audio = spectral_subtraction(noisy_audio, clean_audio, sr)

# Save the filtered audio
sf.write('filtered_machine_sound.wav', filtered_audio, sr)

# Plot the spectrograms
plt.figure(figsize=(12, 8))

# Plot noisy audio spectrogram
plt.subplot(3, 1, 1)
noisy_spec = librosa.amplitude_to_db(np.abs(librosa.stft(noisy_audio)), ref=np.max)
librosa.display.specshow(noisy_spec, sr=sr, x_axis='time', y_axis='log')
plt.colorbar(format='%+2.0f dB')
plt.title('Noisy Audio Spectrogram')

# Plot clean audio spectrogram
plt.subplot(3, 1, 2)
clean_spec = librosa.amplitude_to_db(np.abs(librosa.stft(clean_audio)), ref=np.max)
librosa.display.specshow(clean_spec, sr=sr, x_axis='time', y_axis='log')
plt.colorbar(format='%+2.0f dB')
plt.title('Clean Audio Spectrogram')

# Plot filtered audio spectrogram
plt.subplot(3, 1, 3)
filtered_spec = librosa.amplitude_to_db(np.abs(librosa.stft(filtered_audio)), ref=np.max)
librosa.display.specshow(filtered_spec, sr=sr, x_axis='time', y_axis='log')
plt.colorbar(format='%+2.0f dB')
plt.title('Filtered Audio Spectrogram')

plt.tight_layout()
# plt.show()