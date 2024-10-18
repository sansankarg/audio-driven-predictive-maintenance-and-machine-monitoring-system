import React from "react";
import { Link } from "react-router-dom";
import '../CSS/Page1.css'
var User=()=>{
    return(
        <div className="background-wrapper">
            <nav className="navbar navbar-expand-md bg-dark justify-content-end usernavbar">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link to="/login" className="custom-link"><button className="btn btn-light m-3">Log In</button></Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/signup" className="custom-link"><button className="btn btn-light m-3">Sign Up</button></Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
export default User