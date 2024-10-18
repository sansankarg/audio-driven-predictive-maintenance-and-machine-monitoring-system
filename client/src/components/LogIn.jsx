import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import '../CSS/Signup.css'
import { useAuth } from "./AuthContext"
import {io} from "socket.io-client"

const socket=io("http://localhost:5007")
var LogIn=()=>{
    var [emailUser,setEmailUser]=useState("")
    var [password,setPassword]=useState("")
    const navigate=useNavigate()
    const { login } = useAuth();

    socket.on('login_staus',(data)=>{
        console.log(data.message)
        alert(data.message) 
    })
    async function userlog(event) {
        event.preventDefault()
        const record=await axios.post("http://localhost:5007/login",({
            email:emailUser,
            username:emailUser,
            password:password
        }))
        if(record.data.message==="Login Success")
        {
            login(record.data.username);
            navigate('/industry')
        }
        else
        {
            alert(record.data.message)
        }
    }
    return(
        <div className="container">
        <div className="box">
        <center><h3 style={{color:"black"}}>Log In</h3><br></br>
           <form onSubmit={userlog}>
            <div className="form-floating">
                    <input className="form-control" type="text" placeholder="Username/Email" required onChange={(e)=>setEmailUser(e.target.value)}></input>
                    <label className="form-label">Username/Email</label>
                </div><br></br>
                <div className="form-floating">
                    <input className="form-control" type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)}></input>
                    <label className="form-label">Password</label>
                </div><br></br>
                <button className="btn btn-primary" style={{width:'50%'}}>Log In</button><br></br>
                <span style={{color:"black"}}>Don't have an account? <a className="SignUpanchor" href="/signup">Sign Up</a></span>
            </form></center>
            
        </div>
    </div>
    )
}
export default LogIn