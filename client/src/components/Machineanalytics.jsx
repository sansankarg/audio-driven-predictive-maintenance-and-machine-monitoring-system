import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom"; // For getting the machine name from route params
import Piechart from "./Pie"; // Import the Piechart component
import axios from "axios"; // Import Axios
import { useAuth } from "./AuthContext";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2"; // Import Bar chart component
import jsPDF from "jspdf"; // For generating PDF
import html2canvas from "html2canvas"; // For taking screenshots of the div to convert to PDF
import "./MachineAnalytics.css"; // Create a CSS file for styling
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const socket = io("http://localhost:5007");

const MachineAnalytics = () => {
  const { machineId } = useParams(); // Assuming you're passing the machine name through the URL
  const [runningPercentage, setRunningPercentage] = useState(0);
  const [machineName, setMachineName] = useState("");
  const [notRunningPercentage, setNotRunningPercentage] = useState(0);
  const [healthyPercentage, setHealthyPercentage] = useState(0);
  const [faultyPercentage, setFaultyPercentage] = useState(0);
  const [nilPercentage, setNilPercentage] = useState(0);
  const [faultCounts, setFaultCounts] = useState({});
  const [timeFilter, setTimeFilter] = useState("day");
  const [amplitudeData, setAmplitudeData] = useState([]);
  const [rmsData, setRmsData] = useState([]);
  const [zcrData, setZcrData] = useState([]);
  const [status, setStatus] = useState([]);
  const [healthyMFCC, setHealthyMFCC] = useState("");
  const [faultyMFCC, setFaultyMFCC] = useState("");
  const [notRunningMFCC, setNotRunningMFCC] = useState("");
  const [timestampData, setTimestampData] = useState([]);
  const { username } = useAuth();

  useEffect(() => {
    // Fetch initial data for the specific machine using Axios
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5007/machine-analytics/${machineId}`,
          {
            params: { username, time_filter: timeFilter },
          }
        );
        const data = response.data;
        setMachineName(data.machine_name);
        setRunningPercentage(data.running_percentage.toFixed(2));
        setNotRunningPercentage(data.not_running_percentage.toFixed(2));
        setHealthyPercentage(data.healthy_percentage.toFixed(2));
        setFaultyPercentage(data.faulty_percentage.toFixed(2));
        setNilPercentage(data.nil_percentage.toFixed(2));
        setFaultCounts(data.fault_counts);
        setAmplitudeData(
          data.amplitude_mean.map((amplitude) =>
            parseFloat(amplitude).toFixed(10)
          )
        );
        setRmsData(
          data.rms_mean.map((amplitude) => parseFloat(amplitude).toFixed(10))
        );
        setZcrData(
          data.zcr_mean.map((amplitude) => parseFloat(amplitude).toFixed(10))
        );
        setTimestampData(
          data.time_stamps.map((ts) => new Date(ts).toISOString())
        );
        setStatus(data.status);
        setHealthyMFCC(data.healthy_plot);
        setFaultyMFCC(data.faulty_plot);
        setNotRunningMFCC(data.notrunning_plot);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();

    // Cleanup on component unmount
    return () => {
      socket.off(`machine_analytics_${machineId}`);
    };
  }, [machineId, username, timeFilter]);

  const barChartData = {
    labels: Object.keys(faultCounts),
    datasets: [
      {
        label: "Fault Count",
        data: Object.values(faultCounts),
        backgroundColor: "#FF6384",
      },
    ],
  };

  // Prepare data for Piechart
  const pieChartData = {
    labels: ["Running", "Not Running"],
    datasets: [
      {
        label: "Machine Status",
        data: [runningPercentage, notRunningPercentage],
        backgroundColor: ["#36A2EB", "#FF6384"], // Colors for the segments
        hoverOffset: 4,
      },
    ],
  };

  const healthPieChartData = {
    labels: ["Healthy", "Faulty"],
    datasets: [
      {
        label: "Machine Health",
        data: [healthyPercentage, faultyPercentage],
        backgroundColor: ["#4BC0C0", "#FFCE56"], // Colors for the segments
        hoverOffset: 4,
      },
    ],
  };

  // Prepare data for bar charts
  const prepareBarChartData = (data, status) => {
    const runningHealthyData = [];
    const runningFaultyData = [];
    const notRunningData = [];
    const filteredTimestamps = [];

    for (let i = 0; i < data.length; i++) {
      if (status[i] === 2) {
        runningHealthyData.push(data[i]);
        runningFaultyData.push(0); // Use 0 for bar chart representation
        notRunningData.push(0); // Use 0 for bar chart representation
      } else if (status[i] === 1) {
        runningFaultyData.push(data[i]); // Use 0 for bar chart representation
        notRunningData.push(0);
        runningHealthyData.push(0);
      } else {
        runningFaultyData.push(0); // Use 0 for bar chart representation
        notRunningData.push(data[i]);
        runningHealthyData.push(0);
      }
      filteredTimestamps.push(timestampData[i]);
    }

    return {
      labels: filteredTimestamps,
      datasets: [
        {
          label: "Running Healthy",
          data: runningHealthyData,
          backgroundColor: "rgba(35, 198, 96, 0.5)", // Light green
        },
        {
          label: "Running Faulty",
          data: runningFaultyData,
          backgroundColor: "rgba(54, 162, 235, 0.5)", // Light blue
        },
        {
          label: "Not Running",
          data: notRunningData,
          backgroundColor: "rgba(255, 99, 132, 0.5)", // Light red
        },
      ],
    };
  };

  const amplitudeBarChartData = prepareBarChartData(amplitudeData, status);
  const rmsBarChartData = prepareBarChartData(rmsData, status);
  const zcrBarChartData = prepareBarChartData(zcrData, status);

  // Function to download the report as PDF
  const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  html2canvas(document.querySelector("#reportContent"), { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 250; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Calculate how many pages are needed for the full content
    let heightLeft = imgHeight;
    let position = 0;

    // Add the first image
    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    doc.save("${machineName}-report.pdf");
  });
};


  return (
    <div>
      <Navbar />
      <div className="container-fluid" id="reportContent">
        <div className="row">
          <div className="col-md-12">
          <br />
            <h1>Machine Analytics for {machineName}</h1>
          </div>
        </div>
        <div className="row detail1 px-5">
          <div className="col-lg-3 col-md-4 column p-3 border">
            <h2 className="mb-4">Machine Status</h2>
            <div className="d-flex justify-content-center mb-4">
              <Piechart data={pieChartData} />
            </div>
            <table className="table table-striped table-bordered mt-4">
              <thead>
                <tr>
                  <th>Running</th>
                  <td>{runningPercentage}%</td>
                </tr>
                <tr>
                  <th>Not Running</th>
                  <td>{notRunningPercentage}%</td>
                </tr>
              </thead>
            </table>
          </div>

          <div className="col-lg-3 col-md-4 column p-3 border">
            <h2 className="mb-4">Machine Health</h2>
            <div className="d-flex justify-content-center mb-4">
              <Piechart data={healthPieChartData} />
            </div>
            <table className="table table-striped table-bordered mt-4">
              <thead>
                <tr>
                  <th>Healthy</th>
                  <td>{healthyPercentage}%</td>
                </tr>
                <tr>
                  <th>Faulty</th>
                  <td>{faultyPercentage}%</td>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        <div className="row px-5">
          <div className="col-ms-12 m-5 border d-flex flex-column px-5">
            <h3 className="heading">Fault Count by Day/Month/Year</h3>
            <Line data={barChartData} />
            <div className="d-flex justify-content-end mb-3">
              <label className="me-2">Time Filter: </label>
              <button
                className={`btn btn-sm me-2 ${
                  timeFilter === "day" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setTimeFilter("day")}
              >
                Day
              </button>
              <button
                className={`btn btn-sm me-2 ${
                  timeFilter === "month" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setTimeFilter("month")}
              >
                Month
              </button>
              <button
                className={`btn btn-sm ${
                  timeFilter === "year" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setTimeFilter("year")}
              >
                Year
              </button>
            </div>
          </div>
        </div>
        
        <div className=" min-vh-70">
        <div className="row">
          <div className="col-md12">
            <h1>Audio features classification of audios</h1>
          </div>
        </div>

        <div className="row detail2">
          <div className="col-lg-3 col-md-4 column p-3 border">
            <h2 className="heading">Amplitude Mean</h2>
            <Bar data={amplitudeBarChartData} />
          </div>
          <div className="col-lg-3 col-md-4 column p-3 border">
            <h2 className="heading">RMS Mean</h2>
            <Bar data={rmsBarChartData} />
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3 col-md-4 column p-3 border">
            <h2 className="heading">ZCR Mean</h2>
            <Bar data={zcrBarChartData} />
          </div>
          <div
            id="carouselExampleIndicators"
            className="carousel slide col-lg-3 col-md-4 column p-3 border"
            data-bs-ride="carousel"
          >
            <div className="carousel-indicators">
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="0"
                className="active"
                aria-current="true"
                aria-label="Slide 1"
              ></button>
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="1"
                aria-label="Slide 2"
              ></button>
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="2"
                aria-label="Slide 3"
              ></button>
            </div>

            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="col-lg-12 d-flex flex-column align-items-center">
                  <h2 className="heading">
                    MFCC Spectrogram of Healthy Machine
                  </h2>
                  <img
                    src={healthyMFCC}
                    alt="MFCC"
                    className="img-fluid w-75"
                  />
                </div>
              </div>

              <div className="carousel-item">
                <div className="col-lg-12 d-flex flex-column align-items-center">
                  <h2 className="heading">
                    MFCC Spectrogram of Faulty Machine
                  </h2>
                  <img src={faultyMFCC} alt="MFCC" className="img-fluid w-75" />
                </div>
              </div>

              <div className="carousel-item">
                <div className="col-lg-12 d-flex flex-column align-items-center">
                  <h2 className="heading">MFCC Spectrogram of Down Machine</h2>
                  <img
                    src={notRunningMFCC}
                    alt="MFCC"
                    className="img-fluid w-75"
                  />
                </div>
              </div>
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        <button onClick={downloadPDF} style={{ marginTop: "20px" }}>
          Download Report
        </button>
      </div>
      </div>
    </div>
  );
};

export default MachineAnalytics;
