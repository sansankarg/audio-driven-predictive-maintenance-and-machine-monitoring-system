import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "../CSS/Notification.css"; // Ensure this CSS file includes the button styles

const Notification = () => {
  const { username } = useAuth();
  const [faults, setFaults] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortType, setSortType] = useState("date");
  const [deletingFaultId,setDeletingFaultId]=useState(null)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}:${month}:${year}`;
  };

  useEffect(() => {
    const fetchFaults = async () => {
      console.log(username)
      if (username) {
        try {
          const response = await axios.get("http://localhost:5007/faults", {
            params: { username },
          });
          setFaults(response.data.faults);
        } catch (error) {
          console.error("Error fetching results:", error);
        }
      }
    };
    fetchFaults();
  }, [username]);

  const handleDeleteFault = async (faultId) => {
    setDeletingFaultId(faultId);
    setTimeout(async () => {
      try {
        const response = await axios.delete(`http://localhost:5007/faults/${faultId}`, {
          params: { username },
        });
        if (response.status === 200) {
          setFaults((prevFaults) => prevFaults.filter((fault) => fault.fault_id !== faultId));
          setDeletingFaultId(null); // Reset the deleting state after deletion
        }
      } catch (error) {
        console.error("Error deleting fault:", error);
      }
    }, 500); // Matches the duration of the CSS animation
  };

  // Apply sorting when sortType or sortOrder changes
  useEffect(() => {
    // Sort the faults and only update the state if the sorted data is different
    const handleSort = (type, order) => {
      const sortedFaults = [...faults].sort((a, b) => {
        const dateA = new Date(a.fault_time);
        const dateB = new Date(b.fault_time);

        if (type === "date") {
          return order === "asc" ? dateA - dateB : dateB - dateA;
        } else if (type === "month") {
          // Compare years first, then months
          const yearDiff = dateA.getFullYear() - dateB.getFullYear();
          if (yearDiff !== 0) return order === "asc" ? yearDiff : -yearDiff;
          return order === "asc"
            ? dateA.getMonth() - dateB.getMonth()
            : dateB.getMonth() - dateA.getMonth();
        } else if (type === "year") {
          return order === "asc"
            ? dateA.getFullYear() - dateB.getFullYear()
            : dateB.getFullYear() - dateA.getFullYear();
        }
        return 0;
      });

      // Only update the state if the sorted faults are different
      if (JSON.stringify(sortedFaults) !== JSON.stringify(faults)) {
        setFaults(sortedFaults);
      }
    };


    handleSort(sortType, sortOrder);
  }, [sortType, sortOrder, faults]); // Dependencies on sortType, sortOrder, and faults

  return (
    <div className="notification-container container-fluid">
      <form className="form">
      <h2 className="title">Notifications</h2>
      </form>
      <div className="sorting-container">
        {/* Sort By Dropdown */}
        <div className="dropdown">
          <button className="sort-dropdown">
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="filter-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v3a1 1 0 01-.293.707L15 12.414V16a1 1 0 01-.293.707l-2 2A1 1 0 0111 18v-5.586L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
            </span>
            Sort by: {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
            <span className="caret">&#x25BC;</span>
          </button>
          <div className="dropdown-content">
            <button onClick={() => setSortType("date")}>Date</button>
            <button onClick={() => setSortType("month")}>Month</button>
            <button onClick={() => setSortType("year")}>Year</button>
          </div>
        </div>

        {/* Order By Dropdown */}
        <div className="dropdown">
          <button className="sort-dropdown">
            Order by: {sortOrder === "asc" ? "Ascending" : "Descending"}
            <span className="caret">&#x25BC;</span>
          </button>
          <div className="dropdown-content">
            <button onClick={() => setSortOrder("asc")}>Ascending</button>
            <button onClick={() => setSortOrder("desc")}>Descending</button>
          </div>
        </div>
      </div>

      <div className="fault-list">
        {faults.length > 0 ? (
          faults.map((fault) => (
            <div key={fault.fault_id} className={`fault-row ${deletingFaultId === fault.fault_id ? "fade-out" : ""}`}>
              <div className="fault-details">
                <h5>{fault["machine name"]}</h5>
                <p>Fault Time: {`${new Date(fault.fault_time).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })} ${new Date(fault.fault_time).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second:'2-digit',
                  hour12: true, // Set to true for 12-hour format
                })}`}</p>
              </div>
              {/* Use the custom button here */}
              <button className="delete-button" onClick={() => handleDeleteFault(fault.fault_id)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 69 14"
                  className="svgIcon bin-top"
                >
                  <g clipPath="url(#clip0_35_24)">
                    <path
                      fill="black"
                      d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_35_24">
                      <rect fill="white" height="14" width="69"></rect>
                    </clipPath>
                  </defs>
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 69 57"
                  className="svgIcon bin-bottom"
                >
                  <g clipPath="url(#clip0_35_22)">
                    <path
                      fill="black"
                      d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_35_22">
                      <rect fill="white" height="57" width="69"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="no-faults">No faults reported.</p>
        )}
      </div>
    </div>
  );
};

export default Notification;