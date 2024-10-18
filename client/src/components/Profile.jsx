import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
const Profile=()=>{
    const [userDetails,setUserDetails]=useState(null)
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const {username,logout}=useAuth();
    const navigate=useNavigate();
    useEffect(()=>{
        const fetchUserDetails=async ()=>{
            try{
                const response=await axios.get("http://localhost:5007/users",{
                    params:{username},
                    withCredentials:true
                });
                setUserDetails(response.data.user)
            } catch (err) {
                setError("Failed to fetch user details");
                console.error(err);
              } finally {
                setLoading(false);
              }
        };
        fetchUserDetails();
    },[username])

    const handleLogout=async ()=>{
        console.log("Logout intiated")
        try{
            await axios.post('http://localhost:5007/logout',{},{withCredentials:true});
            logout()
            navigate("/login")
        }
        catch (err) {
            console.error("Error logging out", err);
          }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    return(
        <div>
        <h2>Profile</h2>
        {userDetails ? (
          <div>
            <p><strong>Username:</strong> {userDetails.username}</p>
            <p><strong>Full Name:</strong> {userDetails.fullname}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>No user details available</div>
        )}
      </div>
    )
}
export default Profile