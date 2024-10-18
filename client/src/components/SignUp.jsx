import { useState } from "react"
import axios from 'axios'
import Icon from 'react-icons-kit'
import {useNavigate} from 'react-router-dom'
import {basic_eye} from 'react-icons-kit/linea/basic_eye'
import {basic_eye_closed} from 'react-icons-kit/linea/basic_eye_closed'
import {arrows_circle_check} from 'react-icons-kit/linea/arrows_circle_check'
import {basic_exclamation} from 'react-icons-kit/linea/basic_exclamation'
import { arrows_circle_remove } from "react-icons-kit/linea/arrows_circle_remove"
import '../CSS/Signup.css'
var SignUp=()=>{
    const[lower,setLower]=useState(false)
    const[upper,setUpper]=useState(false)
    const[number,setNumber]=useState(false)
    const[special,setSpecial]=useState(false)
    const[length,setLength]=useState(false)
    

    var typeofpassword="password"

    var [passwordfocus,setPasswordfocus]=useState(false)
    var [showpassword,setShowPassword]=useState(false)
    var [email,setEmail]=useState("")
    var [fullname,setName]=useState("")
    var [username,setUserName]=useState("")
    var [password,setPassword]=useState("")
    var [confirmpassword,setCPassword]=useState("")
    const [respondMessage,setResponseMessage]=useState("")
    const navigate=useNavigate()
    const visibilityicon=()=>{
        setShowPassword(!showpassword)
    }

    const onPasswordfocus=()=>{
        setPasswordfocus(true)
    }

    const onPasswordblur=()=>{
        setPasswordfocus(false)
    }

    const validationPassword=(value)=>{
        const lowerCase=new RegExp('(?=.*[a-z])')
        const upperCase=new RegExp('(?=.*[A-Z])')
        const numberChar=new RegExp('(?=.*[0-9])')
        const specialChar=new RegExp('(?=.*[!@#\$%\^&*\*])')
        const lengthPass=new RegExp('(?=.{8,})')

        if(lowerCase.test(value))
        {
            setLower(true)
        }
        else
        {
            setLower(false)
        }

        if(upperCase.test(value))
        {
            setUpper(true)
        }
        else
        {
            setUpper(false)
        }

        if(numberChar.test(value))
        {
            setNumber(true)
        }
        else
        {
            setNumber(false)
        }

        if(specialChar.test(value))
        {
            setSpecial(true)
        }
        else
        {
            setSpecial(false)
        }

        if(lengthPass.test(value))
        {
            setLength(true)
        }
        else
        {
            setLength(false)
        }
    }
    
    async function signup(event) {
        event.preventDefault();
        try {
            const record = await axios.post("http://localhost:5007/signup", {
                email: email,
                fullname: fullname,
                username: username,
                password: password,
                confirmpassword: confirmpassword,
            });
    
            // Display the message returned from the server
            setResponseMessage(record.data.message); // Update the state with the response message
    
            // Show the response message in an alert
            if (record.data.message !== "Sign Up Successful") {
                alert(record.data.message); // Display error message if sign-up was unsuccessful
            } else {
                navigate('/login'); // Navigate to login page on success
            }
        } catch (error) {
            // Log the error to console for debugging
            console.error("Error during sign up:", error);
    
            // Extract the error message from the response if available
            const errorMessage = error.response?.data?.message || "An error occurred during sign up. Please try again.";
    
            // Alert the user with the error message
            alert(errorMessage);
        }
    }
    
    
    var onsubmitvalidation=(event)=>{
        event.preventDefault()
        if(lower && upper && number && special && length)
        {
            signup(event);
        }
        else
        {
            alert("Password didn't satisfy the condition")
        }
    }
    return(
        <div className="container">
            <div className="box">
            <center><h3 style={{color:"black"}}>Sign Up</h3><br></br>
                <form onSubmit={onsubmitvalidation}>
                <div className="form-floating">
                        <input className="form-control" type="text" placeholder="Email Id" required onChange={(e)=>setEmail(e.target.value)}></input>
                        <label className="form-label">Emai Id</label>
                    </div><br></br>
                    <div className="form-floating">
                        <input className="form-control" type="text" placeholder="Full Name" required onChange={(e)=>setName(e.target.value)}></input>
                        <label className="form-label">Full Name</label>
                    </div><br></br>

                    <div className="form-floating">
                        <input className="form-control" type="text" placeholder="Username" required onChange={(e)=>setUserName(e.target.value)}></input>
                        <label className="form-label">Username</label>
                    </div><br></br>
                    <div className="form-floating password-wrapper">
                            <input className="form-control" type={showpassword?"text":"password"} placeholder="Password" required onChange={(e)=>{setPassword(e.target.value);validationPassword(e.target.value)}} onFocus={onPasswordfocus} onBlur={onPasswordblur}></input>
                            <span className="eye-icon" onMouseDown={visibilityicon}>
                                <Icon icon={showpassword?basic_eye:basic_eye_closed} size={24}></Icon>
                            </span>
                            <label className="form-label">Password</label>
                    </div><br></br>
                    {passwordfocus && (
                        <div className="validitybox">
                        <div className={lower?'validated':'not-validated'}>
                            {lower?(
                                <span className="check-icon green">
                                    <Icon icon={arrows_circle_check}/>
                                </span>
                            ):(
                                <span className="check-icon red">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            )}
                            At least one lowercase letter</div>
                        <div className={upper?'validated':'not-validated'}>
                            {upper?(
                                <span className="check-icon green">
                                    <Icon icon={arrows_circle_check}/>
                                </span>
                            ):(
                                <span className="check-icon red">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            )}
                            At least one uppercase letter</div>
                        <div className={number?'validated':'not-validated'}>
                        {number?(
                                <span className="check-icon green">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            ):(
                                <span className="check-icon red">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            )}
                            At least one number</div>
                        <div className={special?'validated':'not-validated'}>
                        {special?(
                                <span className="check-icon green">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            ):(
                                <span className="check-icon red">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            )}
                            At least one special character</div>
                        <div className={length?'validated':'not-validated'}>
                        {length?(
                                <span className="check-icon green">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            ):(
                                <span className="check-icon red">
                                    <Icon icon={arrows_circle_remove}/>
                                </span>
                            )}
                            At least 8 characters</div><br></br>
                        </div>
                    )

                    }
                    <div className="form-floating">
                        <input className="form-control" type="password" placeholder="Confirm Password" required onChange={(e)=>setCPassword(e.target.value)}></input>
                        <label className="form-label">Confirm Password</label>
                    </div><br></br>
                    <button className="btn btn-primary" style={{width:'50%'}}>Sign Up</button><br></br>
                <span style={{color:"black"}}>Have an account? <a className="SignUpanchor" href="/login">Log in</a></span>
                </form></center>
                
            </div>
        </div>
        
    )
}
export default SignUp