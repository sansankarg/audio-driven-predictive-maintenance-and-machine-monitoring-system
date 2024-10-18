import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [machineData, setMachineData] = useState([]);
  const { username } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load last received data from local storage
    const savedMachineData = localStorage.getItem("machineData");
    if (savedMachineData) {
      setMachineData(JSON.parse(savedMachineData));
    }

    // Initialize the socket connection once on component mount
    const newSocket = io('http://127.0.0.1:5007', {
      transports: ["websocket", "polling"],
      cors: {
        origin: "http://localhost:3000",
      },
    });

    // Listen for incoming data once connected
    newSocket.on('connect', () => {
      console.log("Socket connected");
      newSocket.emit('dashboard', { message: 'Hello from ar!' });
    });

    newSocket.on('sent_data', (data) => {
      console.log("Data received:", data); // Log to see exact structure
      setMachineData(data.machine);
      // Save the received data in local storage
      localStorage.setItem("machineData", JSON.stringify(data.machine));
    });

    newSocket.on('sent_datum', (data) => {
      console.log("Alert data received:", data);
      // You can update a state for alerts here if needed
    });

    // Clean up the socket connection on unmount
    return () => {
      console.log("Socket disconnected");
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleAnalytics = (machine) => {
    // Navigate to the MachineAnalytics component with machine_name as a URL parameter
    navigate(`/machine-analytics/${machine.machineId}`);
  };

  return (
    <div className="container mt-5">
      <form className="form"><h2 className="title">Machine Dashboard</h2></form>
      <table className="table mt-3">
        <thead>
          <tr>
            <th className="bg-dark text-light">Machine Name</th>
            <th className="bg-dark text-light">Status</th>
            <th className="bg-dark text-light">Health</th>
            <th className="bg-dark text-light">Zone</th>
            <th className="bg-dark text-light">Action</th>
          </tr>
        </thead>
        <tbody>
          {machineData.length > 0 ? (
            machineData.map((machine, index) => (
              <tr key={index}>
                <td>{machine.machine_name}</td>
                <td>{machine.status}</td>
                <td>{machine.health}</td>
                <td>{machine.zone}</td>
                <td>
                  <span class="material-symbols-outlined" onClick={()=>handleAnalytics(machine)} style={{cursor:'pointer',marginLeft:'10px'}}>
                    monitoring
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;