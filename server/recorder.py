import wave
from dataclasses import dataclass, asdict
import pyaudio

@dataclass
class StreamParams:
    format: int = pyaudio.paInt16
    channels: int = 1  # Mono for a single source
    rate: int = 44100  # Standard sample rate
    frames_per_buffer: int = 1024
    input: bool = True
    output: bool = False
    input_device_index: int = 2  # Replace with the correct device index for WO Mic

    def to_dict(self) -> dict:
        return asdict(self)


class Recorder:
    def __init__(self, stream_params: StreamParams) -> None:
        self.stream_params = stream_params
        self._pyaudio = None
        self._stream = None
        self._wav_file = None

    def record(self, duration: int, save_path: str) -> None:
        print(f"LiveData started for {duration} seconds on mic index : {self.stream_params.input_device_index}")
        self._create_recording_resources(save_path)
        self._write_wav_file_reading_from_stream(duration)
        self._close_recording_resources()
        print("LiveData ended")

    def _create_recording_resources(self, save_path: str) -> None:
        self._pyaudio = pyaudio.PyAudio()
        self._stream = self._pyaudio.open(**self.stream_params.to_dict())
        self._create_wav_file(save_path)

    def _create_wav_file(self, save_path: str):
        self._wav_file = wave.open(save_path, "wb")
        self._wav_file.setnchannels(self.stream_params.channels)
        self._wav_file.setsampwidth(self._pyaudio.get_sample_size(self.stream_params.format))
        self._wav_file.setframerate(self.stream_params.rate)

    def _write_wav_file_reading_from_stream(self, duration: int) -> None:
        for _ in range(int(self.stream_params.rate * duration / self.stream_params.frames_per_buffer)):
            audio_data = self._stream.read(self.stream_params.frames_per_buffer)
            self._wav_file.writeframes(audio_data)

    def _close_recording_resources(self) -> None:
        self._wav_file.close()
        self._stream.close()
        self._pyaudio.terminate()

    def record_and_get_filepath(self, duration: int, save_path: str) -> str:
        self.record(duration, save_path)
        return save_path


if __name__ == "__main__":
    stream_params = StreamParams()
    recorder = Recorder(stream_params)
    recorder.record(20, "Audio4/Healthy/10.wav")
