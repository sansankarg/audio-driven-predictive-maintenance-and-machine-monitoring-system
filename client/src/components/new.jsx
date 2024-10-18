import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom'; // For getting the machine name from route params
import Piechart from './Pie'; // Import the Piechart component
import Linechart from './Line';
import Barchart from './Bar';
import axios from 'axios'; // Import Axios
import { useAuth } from './AuthContext';
const socket = io('http://localhost:5007');

const MachineAnalytics = () => {
  const { machineId } = useParams(); // Assuming you're passing the machine name through the URL
  const [runningPercentage, setRunningPercentage] = useState(0);
  const [notRunningPercentage, setNotRunningPercentage] = useState(0);
  const [healthyPercentage, setHealthyPercentage] = useState(0);
  const [faultyPercentage, setFaultyPercentage] = useState(0);
  const [nilPercentage,setNilPercentage]=useState(0)
  const [faultCounts,setFaultCounts]=useState({})
  const [timeFilter,setTimeFilter]=useState('day')
  const { username } = useAuth()

  useEffect(() => {
    // Fetch initial data for the specific machine using Axios
    const fetchData = async () => {
      try {
        // console.log(username)
        // console.log(machine_name)
        const response = await axios.get('http://localhost:5007/machine-analytics/${machineId}', {
          params: { username,time_filter:timeFilter }
        });
        const data = response.data;
        setRunningPercentage(data.running_percentage);
        setNotRunningPercentage(data.not_running_percentage);
        setHealthyPercentage(data.healthy_percentage)
        setFaultyPercentage(data.faulty_percentage)
        setNilPercentage(data.nil_percentage)
        setFaultCounts(data.fault_counts)
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();

    // Listen for live updates for the specific machine
    // socket.on(machine_analytics_${machine_name}, (data) => {
    //   setRunningPercentage(data.running_percentage);
    //   setNotRunningPercentage(data.not_running_percentage);
    // });

    // Cleanup on component unmount
    return () => {
      socket.off('machine_analytics_${machineId}');
    };
  }, [machineId,username,timeFilter]);

  const lineChartData={
    labels:Object.keys(faultCounts),
    datasets: [
      {
        label: 'Fault Occurrences',
        data: Object.values(faultCounts),
        fill: false,
        borderColor: '#36A2EB',
      },
    ],
  };


  const barChartData = {
    labels: Object.keys(faultCounts),
    datasets: [
      {
        label: 'Fault Count',
        data: Object.values(faultCounts),
        backgroundColor: '#FF6384',
      },
    ],
  };
  // Prepare data for Piechart
  const runningPieChartData = {
    labels: ['Running', 'Not Running'],
    datasets: [
      {
        label: 'Machine Status',
        data: [runningPercentage, notRunningPercentage],
        backgroundColor: ['#36A2EB', '#FF6384'], // Colors for the segments
        hoverOffset: 4,
      },
    ],
  };
  const healthPieChartData = {
    labels: ['Healthy', 'Faulty','Machine down/None'],
    datasets: [
      {
        label: 'Machine Health',
        data: [healthyPercentage, faultyPercentage,nilPercentage],
        backgroundColor: ['#4BC0C0', '#FFCE56','#FF6384'], // Colors for the segments
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div style={{ width: '50%', margin: 'auto' }}>
      <h2>Machine Analytics for {machineId}</h2>
      <p>Running Percentage: {runningPercentage}%</p>
      <p>Not Running Percentage: {notRunningPercentage}%</p>

      {/* Pass the pieChartData to Piechart component */}
      <Piechart data={runningPieChartData} />

      <h2>Health Analytics for {machineId}</h2>
      <p>Healthy Percentage: {healthyPercentage}%</p>
      <p>Faulty Percentage: {faultyPercentage}%</p>
      <p>Machine Down Percentage: {nilPercentage}%</p>

      {/* Healthy/Faulty Piechart */}
      <Piechart data={healthPieChartData} />

      <div>
        <label>Time Filter: </label>
        <button onClick={() => setTimeFilter('day')}>Day</button>
        <button onClick={() => setTimeFilter('month')}>Month</button>
        <button onClick={() => setTimeFilter('year')}>Year</button>
      </div>

      <h3>Fault Occurrences Over Time</h3>
      <Linechart data={lineChartData} />

      {/* Bar Chart for Fault Counts */}
      <h3>Fault Count by Day/Month/Year</h3>
      <Barchart data={barChartData} />

      <button onClick={() => window.history.back()}>Back to Dashboard</button>
    </div>
  );
};

export default MachineAnalytics;