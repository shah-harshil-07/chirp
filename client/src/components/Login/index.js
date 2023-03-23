import "./index.css";

import React from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";

import CustomModal from "../CustomModal";

const Login = () => {
    const loginBodyJSX = (
        <>
            <div className="auth-box">
                <span className="d-flex justify-content-center align-items-center">
                    <CIcon icon={cibGoogle} id="google-signup-icon" />
                    <span id="google-signup-text">Sign in with google</span>
                </span>
            </div>

            <div className="or-box">
                <hr style={{ backgroundColor: "#bbc2c9" }} />
                <div className="or-div">or</div>
            </div>

            <input type="text" placeholder="Phone, email or username" className="input-text" />

            <div className="auth-box" id="next-box">
                <span className="d-flex justify-content-center align-items-end auth-text">Next</span>
            </div>

            <div className="auth-box" id="forgot-box">
                <span className="d-flex justify-content-center align-items-end auth-text">Forgot Password?</span>
            </div>

            <div className="bottom-text">
                Don't have an account? <span style={{ color: "#1DA1F2" }}>Sign up</span>
            </div>
        </>
    )

    return (
        <CustomModal bodyJSX={loginBodyJSX} />
    )
}

export default Login;
