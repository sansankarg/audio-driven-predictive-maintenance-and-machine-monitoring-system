import React, { useEffect, useState } from "react";
import axios from "axios";
import '../CSS/Industry.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./AuthContext";

const PlantManager = () => {
  const [plantName, setPlantName] = useState("");
  const [plantDescription, setPlantDescription] = useState("");
  const [isPlantCreated, setIsPlantCreated] = useState(false);
  const [zones, setZones] = useState([]);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDescription, setNewZoneDescription] = useState("");
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [micIndex, setMicIndex] = useState("");
  const [machineDescription, setMachineDescription] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const [editingZoneIndex, setEditingZoneIndex] = useState(null);
  const [editingMachineIndex, setEditingMachineIndex] = useState(null);
  const [editedZoneName, setEditedZoneName] = useState("");
  const [editedZoneDescription, setEditedZoneDescription] = useState("");
  const [editedMachineName, setEditedMachineName] = useState("");
  const [editedMicIndex, setEditedMicIndex] = useState("");
  const [editedMachineDescription, setEditedMachineDescription] = useState("");
  const [showCreatePlantCard, setShowCreatePlantCard] = useState(false); // New state
  const [showCreatePlantHeading, setShowCreatePlantHeading] = useState(true);
  const { username } = useAuth();

  useEffect(() => {
    const fetchPlantDetails = async () => {
      
      try {
        if (!username) {
          console.error('Username is missing');
          return;
        }
        const response = await axios.get("http://localhost:5007/plant", {
          params: { username },
        });
        const plantData = response.data.plantdata;

        if (plantData) {
          setPlantName(plantData.plantname);
          setPlantDescription(plantData.plantdescription);
          setZones(plantData.zones || []);
          setIsPlantCreated(true);
          setIsEditing(false);
          setShowCreatePlantHeading(false)
          if(zones){
            handleZoneSelect(0)
          }
        }
        console.log(plantData)
      } catch (error) {
        console.log("Error fetching plant data", error);
      }
    };
    fetchPlantDetails();
  }, [username]);

  const handleCreatePlant = (e) => {
    // Custom validation logic
    e.preventDefault()
    if (!plantName || !plantDescription) {
      alert("Please fill in both the plant name and description.");
      return;
    }
    if (plantName.trim() && plantDescription.trim()) {
      setIsPlantCreated(true);
      setShowCreatePlantCard(false)
      setShowCreatePlantHeading(false)
    }
  };

  const addZone = () => {
    console.log(username)
    if (newZoneName.trim() && newZoneDescription.trim()) {
      setZones((prevZones) => [
        ...prevZones,
        { zoneName: newZoneName, zoneDescription: newZoneDescription, machines: [] },
      ]);
      setNewZoneName("");
      setNewZoneDescription("");
      setSelectedZoneIndex(zones.length);
    }
  };

  const handleZoneSelect = (index) => {
    setSelectedZoneIndex(index);
  };

  const handleAddMachine = () => {
    if (
      selectedZoneIndex !== null &&
      machineName.trim() &&
      micIndex.trim() &&
      machineDescription.trim()
    ) {
      const updatedZones = zones.map((zone, index) => {
        if (index === selectedZoneIndex) {
          return {
            ...zone,
            machines: [
              ...zone.machines,
              {
                machineId: Date.now(), // Automatically generated machine ID
                machineName,
                micIndex: parseInt(micIndex),
                machineDescription,
              },
            ],
          };
        }
        return zone;
      });
      setZones(updatedZones);
      setMachineName("");
      setMicIndex("");
      setMachineDescription("");
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    sendDataToBackend();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const sendDataToBackend = async () => {
    try {
      const dataToSend = {
        username,
        plantName,
        plantDescription,
        zones,
      };
      console.log(dataToSend);
      const response = await axios.post("http://localhost:5007/industry", dataToSend);
      console.log("Data sent successfully", response.data);
    } catch (error) {
      console.error("Error sending data to backend", error);
    }
  };

  const handleZoneEdit = (index) => {
    setEditingZoneIndex(index);
    setEditedZoneName(zones[index].zoneName);
    setEditedZoneDescription(zones[index].zoneDescription);
  };

  const handleMachineEdit = (zoneIndex, machineIndex) => {
    setEditingMachineIndex(machineIndex);
    const machine = zones[zoneIndex].machines[machineIndex];
    setEditedMachineName(machine.machineName);
    setEditedMicIndex(machine.micIndex);
    setEditedMachineDescription(machine.machineDescription);
  };

  const handleZoneUpdate = (index) => {
    const updatedZones = zones.map((zone, i) => {
      if (i === index) {
        return { ...zone, zoneName: editedZoneName, zoneDescription: editedZoneDescription };
      }
      return zone;
    });
    setZones(updatedZones);
    setEditingZoneIndex(null); // Exit editing mode after update
  };

  const handleMachineUpdate = (zoneIndex, machineIndex) => {
    const updatedZones = zones.map((zone, i) => {
      if (i === zoneIndex) {
        const updatedMachines = zone.machines.map((machine, j) => {
          if (j === machineIndex) {
            return {
              ...machine,
              machineName: editedMachineName,
              micIndex: editedMicIndex,
              machineDescription: editedMachineDescription,
            };
          }
          return machine;
        });
        return { ...zone, machines: updatedMachines };
      }
      return zone;
    });
    setZones(updatedZones);
    setEditingMachineIndex(null); // Exit editing mode after update
  };

  const toggleCreatePlantCard = () => {
    setShowCreatePlantCard(!showCreatePlantCard);
    setShowCreatePlantHeading(false)
  };

  return (
    <div className="plant-manager-container container-fluid my-5" style={{ height: "50%" }}>
      
      {!showCreatePlantCard && !isPlantCreated && (
        <div className="text-center" style={{
          height: '65vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ color: 'black' }}>Create a Plant</h2>
            <button
              className="btn btn-lg"
              onClick={toggleCreatePlantCard}
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer'
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '10vw', // Make the icon size large based on viewport width
                  color: 'royalblue',  // Set color for the icon
                }}
              >
                add_circle
              </span>
            </button>
          </div>
        </div>
      )}
      {showCreatePlantCard && ( // Show plant card only when add button is clicked
        <div className="card p-4 mt-3 plant-card">
          <div className="mb-3">
            {/* <label className="form-label">Plant Name:</label>
            <input
              type="text"
              className="form-control"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter plant name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Plant Description:</label>
            <textarea
              className="form-control"
              value={plantDescription}
              onChange={(e) => setPlantDescription(e.target.value)}
              placeholder="Enter plant description"
            ></textarea> */}
            <div className="form">
              <p className="title">Create a Plant</p>
              <label>Plant Name:</label>
              <label>
                <input className="input" type="text" value={plantName} placeholder="Enter Plant Name" onChange={(e) => setPlantName(e.target.value)}></input>
              </label>
              <label>Plant Description:</label>
              <label>
                <textarea className="input" value={plantDescription} placeholder="Enter Plant Description" onChange={(e) => setPlantDescription(e.target.value)}></textarea>
              </label>
              <button className="submit" onClick={handleCreatePlant}>Create Plant</button>
            </div>
          </div>
          {/* <button className="btn btn-primary" onClick={handleCreatePlant}>
            Create Plant
          </button> */}
        </div>
      )}



      {isPlantCreated && !showCreatePlantHeading && (
        <div className="row" style={{ height: "100%" }}>
          <div className="col-md-4 plant-zones-container" style={{ paddingRight: "20px" }}>
            <div className="card p-4 mb-4" style={{ height: "100%",border:'0px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="title">{plantName}</h3>
                {isEditing && (
                  <button className="submit" onClick={handleSave}>
                    Save
                  </button>
                )}
                {isPlantCreated && !isEditing && (
                  <div className="d-flex justify-content-between mt-3">
                    <div className="form">
                      <button className="submit" style={{ width: '80px' }} onClick={handleEdit}>
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <h5 className="mb-3">Zones</h5>

              <div className="zone-card-container">
                {zones.length > 0 ? (
                  zones.map((zone, index) => (
                    <div className="zone-card mb-3" key={index} style={{ cursor: "pointer" }}>
                      <div
                        className="zone-card-body"
                        onClick={() => handleZoneSelect(index)}
                        style={{ transition: "transform 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {editingZoneIndex === index ? (
                          <>
                            <div className="form">
                              <label>Zone Name:</label>
                            <label>
                            <input
                              
                              type="text"
                              value={editedZoneName}
                              onChange={(e) => setEditedZoneName(e.target.value)}
                              placeholder="Edit zone name"
                              className="input"
                            />
                            </label>
                            <label>Zone Description</label>
                            <label>
                            <input
                              type="text"
                              value={editedZoneDescription}
                              onChange={(e) => setEditedZoneDescription(e.target.value)}
                              placeholder="Edit zone description"
                              className="input"
                            />
                            </label>
                            <button
                              className="submit" style={{backgroundColor:'green'}}
                              onClick={() => handleZoneUpdate(index)}
                            >
                              Save
                            </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <h5 className="zone-card-title">{zone.zoneName}</h5>
                            <p className="zone-card-text">{zone.zoneDescription}</p>
                            {isEditing && (
                              <div className="form">
                                <button
                                  className="submit"
                                  onClick={() => handleZoneEdit(index)}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No zones added yet.</p>
                )}
              </div>




              {isEditing && (
                <div className="add-zone-form">
                  <h5>Add Zone</h5>
                  <div className="form">
                    <label>Zone Name:</label>
                    <label>
                      <input
                        className="input"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        placeholder="Zone Name"
                      />
                    </label>
                    <label>Zone Description:</label>
                    <label>
                      <input
                        className="input"
                        value={newZoneDescription}
                        onChange={(e) => setNewZoneDescription(e.target.value)}
                        placeholder="Zone Description"
                      />
                    </label>
                    <button className="submit" onClick={addZone}>
                      Add Zone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-8 machines-container">
            <div className="card p-4 mb-4" style={{ height: "100%"}}>
              
              {selectedZoneIndex !== null ? (
                <>
                  <div className="form">
                    <h5 className="title">{zones[selectedZoneIndex].zoneName}</h5>
                  </div>
                  {zones[selectedZoneIndex].machines.length > 0 ? (
                    <ul className="list-group">
                      {zones[selectedZoneIndex].machines.map((machine, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                          style={{ cursor: "pointer", padding: "10px", marginBottom: "10px" }}
                        >
                          {editingMachineIndex === index ? (
                            <>
                              <div className="form">
                              <label>Machine Name:</label>
                              <label>
                              <input
                              className="input"
                                type="text"
                                value={editedMachineName}
                                onChange={(e) => setEditedMachineName(e.target.value)}
                                placeholder="Edit machine name"
                              />
                              </label>
                              <label>Mic Index:</label>
                              <label>
                              <input
                                className="input"
                                type="text"
                                value={editedMicIndex}
                                onChange={(e) => setEditedMicIndex(e.target.value)}
                                placeholder="Edit mic index"
                              />
                              </label>
                              <label>Machine Description:</label>
                              <label>
                              <input
                                className="input"
                                type="text"
                                value={editedMachineDescription}
                                onChange={(e) => setEditedMachineDescription(e.target.value)}
                                placeholder="Edit machine description"
                              />
                              </label>
                              <button
                                className="submit" style={{backgroundColor:'green'}}
                                onClick={() => handleMachineUpdate(selectedZoneIndex, index)}
                              >
                                Save
                              </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th className="text-center">Machine Name</th>
                                    <th className="text-center">Mic Index</th>
                                    <th className="text-center">Description</th>
                                    {isEditing && (
                                      <th className="text-center">Actions</th>

                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="text-center">{machine.machineName}</td>
                                    <td className="text-center">{machine.micIndex}</td>
                                    <td className="text-center">{machine.machineDescription}</td>
                                    {isEditing && (
                                    <td className="text-center">
                                      <div className="form">
                                        <button
                                          className="submit"
                                          style={{ width: '80px', marginLeft: '30%', marginTop: '0%' }}
                                          onClick={() => handleMachineEdit(selectedZoneIndex, index)}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    </td>

                                    )}
                                  </tr>
                                </tbody>
                              </table>

                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No machines added yet.</p>
                  )}

                  {isEditing && (
                    <div className="add-machine-form">
                      <h5>Add Machine</h5>
                      <div className="form">
                      <label>Machine Name:</label>
                      <label>
                      <input
                        type="text"
                        className="input"
                        value={machineName}
                        onChange={(e) => setMachineName(e.target.value)}
                        placeholder="Machine Name"
                      />
                      </label>
                      <label>Mic Index:</label>
                      <label>
                      <input
                        type="text"
                        className="input"
                        value={micIndex}
                        onChange={(e) => setMicIndex(e.target.value)}
                        placeholder="Mic Index"
                      />
                      </label>
                      <label>Machine Description:</label>
                      <label>
                      <input
                        type="text"
                        className="input"
                        value={machineDescription}
                        onChange={(e) => setMachineDescription(e.target.value)}
                        placeholder="Machine Description"
                      />
                      </label>
                      <button className="submit" onClick={handleAddMachine}>
                        Add Machine
                      </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>Select a zone to view or add machines.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantManager;