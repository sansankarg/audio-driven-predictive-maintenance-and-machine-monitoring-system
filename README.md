![audio-driven-predictive-maintenance-and-machine-monitoring-system](https://socialify.git.ci/sansankarg/audio-driven-predictive-maintenance-and-machine-monitoring-system/image?font=KoHo&name=1&owner=1&pattern=Formal%20Invitation&theme=Dark)

# **Audio-Driven Predictive Maintenance and Machine Monitoring System**

## **Tech Stacks**
![Static Badge](https://img.shields.io/badge/Flask)
![Static Badge](https://img.shields.io/badge/Librosa)
![Static Badge](https://img.shields.io/badge/TensorFlow%2FKeras)
![Static Badge](https://img.shields.io/badge/MFCC)
![Static Badge](https://img.shields.io/badge/React)





## **Project Overview**
This project leverages **audio analysis** to monitor and predict the operational health of machines in a smart factory environment. The solution replaces traditional sensors with microphones to capture machine sounds, which are analyzed to classify machine health and detect potential faults before they occur.

By combining audio feature extraction with machine learning, the system provides real-time insights into machine status and generates alerts for maintenance, reducing unplanned downtime and optimizing machine performance.

## **How the System Works**

1. **Audio Capture and Processing:**
   - Microphones placed near machines continuously capture audio signals.
   - These audio signals are pre-processed to extract relevant features like:
     - **Amplitude Mean**: Reflects the overall intensity of the sound.
     - **RMS (Root Mean Square)**: Measures the signal's power and consistency.
     - **Zero Crossing Rate**: Tracks how frequently the audio signal crosses the zero amplitude line.
     - **MFCC (Mel-Frequency Cepstral Coefficients)**: Identifies key frequency patterns to distinguish between normal and faulty machine operations.

2. **Feature Extraction:**
   - Audio features such as **MFCC**, **Amplitude Mean**, **RMS**, and **Zero Crossing Rate** are extracted in real-time using signal processing techniques.
   - These extracted features represent the audio's characteristics, helping to differentiate between healthy and faulty machine sounds.

3. **Machine Learning Analysis:**
   - A **Convolutional Neural Network (CNN)** is used to analyze the extracted audio features.
   - The CNN model classifies the machine sounds into categories such as:
     - **Healthy**: Machine is operating normally.
     - **Faulty**: The sound indicates an operational issue.
     - **Not Running**: Machine is not operating.
   - As the system receives more audio data, the machine learning model continuously improves its accuracy.

4. **Real-Time Dashboard and Alerts:**
   - A **web-based portal** provides operators with real-time access to machine health data.
   - The dashboard displays live machine status, health reports, and alerts for any detected faults.
   - When abnormal sound patterns are detected, the system triggers an **alert** for predictive maintenance, allowing the user to take preventive action.

5. **Predictive Maintenance:**
   - The system generates detailed analytics reports based on historical sound data, showing trends in machine health.
   - By comparing audio patterns over time, the system predicts potential failures and suggests maintenance schedules, minimizing downtime.

## **Tech Stack**

### **Frontend:**
- **React.js**: The user interface is built using React.js, providing an interactive and responsive portal for machine monitoring and reporting.
- **HTML/CSS**: For structuring and styling the portal interface.

### **Backend:**
- **Node.js with Express.js**: The backend API is built with Node.js and Express, handling real-time data processing and communication between the frontend and the machine learning model.
- **MongoDB**: The database for storing machine audio data, operational status, and analytics reports.

### **Machine Learning:**
- **Python**: The machine learning components are implemented using Python, primarily for:
  - Audio feature extraction and preprocessing.
  - Training and deploying the **CNN** model for sound classification.
- **Librosa**: A Python package used for analyzing and extracting features from audio data.
- **TensorFlow/Keras**: Used to build and train the CNN model for classifying machine sounds based on the extracted features.

### **Deployment:**
- **Node.js** and **React.js** are deployed on a server to provide real-time access to machine monitoring data.
- The machine learning model runs either on the server or on a separate computing cluster, depending on the scale of deployment.

## **Project Images**
<!-- Insert project screenshots or images below -->
![Project Image 1](path_to_image_1)
![Project Image 2](path_to_image_2)

---
