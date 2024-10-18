from datetime import datetime
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from recorder import Recorder, StreamParams  # Import Recorder and StreamParams
from filter import spectral_subtraction

model = load_model('Models/trained_model.keras')
HFmodel = load_model('Models/TrainedForFaulty.keras')
RNRmodel = load_model('Models/TrainedForRunning.keras')
HF4model = load_model('Models/HF4.keras')
RNR4model = load_model('Models/RNR4.keras')
HF5model = load_model('Models/HF5.keras')
RNR5model = load_model('Models/RNR5.keras')
isFaulty1 = load_model('Models/isFaulty1.keras')
isRunning = load_model('Models/isRunning.keras')

duration = 10

# Function to extract MFCC and other features
def extract_mfcc(signal, sr, n_mfcc=40, max_len=400):
    mfccs = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=n_mfcc)

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

def sci_to_decimal(sci_num):
    return "{:.20f}".format(sci_num)

# Function to evaluate a segment of audio
def evaluate_audio_segment(audio, sr, model, state):
    faudio = audio
    mfccs = extract_mfcc(faudio, sr)

    amplitude_mean = average_amplitude(faudio)
    rms_mean = calculate_rms(faudio)
    zcr_mean = calculate_zcr(faudio)
    # print("---------------------------DATA------------")
    # print(f"Ampitude mmean : {amplitude_mean}")
    # print(f"RMS mean : {rms_mean}")
    # print(f"ZCR mean : {zcr_mean}")
    # print(f"MFCC : {mfccs}")
    # print("-------------------------------------------")
    # Reshape additional features and repeat to match MFCC time frames
    additional_features = np.array([amplitude_mean, rms_mean, zcr_mean])
    additional_features = np.repeat(additional_features[:, np.newaxis], mfccs.shape[1], axis=1)

    # Concatenate MFCCs and additional features
    features = np.vstack([mfccs, additional_features])

    # Reshape for model input (add batch and channel dimensions)
    features = features[np.newaxis, ..., np.newaxis]  # shape: (1, n_mfcc + 3, max_len, 1)

    # Predict using the loaded model
    prediction = model.predict(features)

    pre = prediction[0][0]  # Return the probability that the machine is faulty

    return [pre, sci_to_decimal(amplitude_mean), sci_to_decimal(rms_mean), sci_to_decimal(zcr_mean)]

def getPrediction(data):
    result = []
    print("------------------------------------------------------------")
    for machine in data:
        machineId=machine['machineId']
        micIndex = machine['micIndex']
        machineName = machine['machineName']
        zoneName = machine['zoneName']
        print(f"{machineName} on {micIndex} mic")
        # Step 1: Set up audio recording for each microphone
        stream_params = StreamParams(input_device_index=micIndex)  # Use specific mic index from micList
        recorded_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        recorder = Recorder(stream_params)

        # Step 2: Record audio and get the file path
        audio_file_path = recorder.record_and_get_filepath(duration,f"LiveData/recorded_audio_mic_{micIndex}.wav")
        # Step 3: Load and evaluate the recorded audio
        audio, sr = librosa.load(audio_file_path, sr=22050)
        isRunresult = evaluate_audio_segment(audio, sr, RNR5model, 0)
        isRunningRes = isRunresult[0]
        amplitude_mean = isRunresult[1]
        rms_mean = isRunresult[2]
        zcr_mean = isRunresult[3]
        isFaultyRes = 0
        if isRunningRes > 0.5:
            current_status = 'RUNNING'
            isFauResult = evaluate_audio_segment(audio, sr, HF5model, 1)
            isFaultyRes = isFauResult[0]
            if isFaultyRes > 0.5:
                health_status = 'FAULTY'
            else:
                health_status = 'HEALTHY'
                isFaultyRes = 1-isFaultyRes
            plotname = f"{health_status}{machineId}"
            plotsave(audio_file_path, plotname)
        else:
            isRunningRes = 1 - isRunningRes
            current_status = 'NOT RUNNING'
            health_status = '-------'
            plotname =  f"NOTRUNNING{machineId}"
            plotsave(audio_file_path,plotname)

        print(f"is {current_status} ({isRunningRes*100}%) with {health_status} ({isFaultyRes*100}%)")

        result.append({
            "machineId":machineId,
            "machine_name": machineName,  # A, B, C, D based on index
            "status": current_status,  # Assuming the mic is connected to a running machine
            "health": health_status,
            "zone": zoneName,
            "micIndex": micIndex,
            "time" : recorded_time,
            "amplitudeMean" : amplitude_mean,
            "rmsMean" : rms_mean,
            "zcrMean" : zcr_mean
        })
    print("------------------------------------------------------------")
    print("")
    return result

def plotsave(audio_path, name):
    print("ploting")
    y, sr = librosa.load(audio_path, sr=None)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    plt.figure(figsize=(10, 6))
    librosa.display.specshow(mfccs, x_axis='time', sr=sr)
    plt.colorbar(format='%+2.0f dB')
    plt.title('MFCC')
    plt.tight_layout()
    plt.savefig(f'Plots/{name}.png')
    print("Image saved")

def isYes(result):
    if(result>0.5):
        print("yes")
    else:
        print("no")

# Example usage
# Call getPrediction to record, predict, and return machine status
# audioh, srh = librosa.load('audio2/Healthy/increasedgain_1.wav')
# audiof, srf = librosa.load('audio2/Faulty/slowed_1.wav')
# audion, srn = librosa.load('audio2/Healthy/normal_1.wav')
# resulth = evaluate_audio_segment(audioh,srh)
# resultf = evaluate_audio_segment(audiof,srf)
# resultn = evaluate_audio_segment(audion,srn)
# isYes(resulth)
# isYes(resultf)
# isYes(resultn)

def check(model1, model2):
    stream_params = StreamParams(input_device_index=2)  # Use specific mic index from micList
    recorded_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    recorder = Recorder(stream_params)
    audio_file_path = recorder.record_and_get_filepath(duration, f"Audio4/Healthy/2.wav")
    # Step 3: Load and evaluate the recorded audio
    audio, sr = librosa.load(audio_file_path, sr=22050)
    isRunresult = evaluate_audio_segment(audio, sr, model1, 1)
    print(isRunresult)
    isFaultyresult = evaluate_audio_segment(audio, sr, model2, 1)
    print(isFaultyresult)

# check(RNR4model, HF5model)