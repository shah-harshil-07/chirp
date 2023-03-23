import "src/styles/auth.css";
import "./index.css";

import React from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import CustomModal from "../CustomModal";

const Register = () => {
    const registerBodyJSX = (
        <>
            <div className="auth-box">
                <span className="d-flex justify-content-center align-items-center">
                    <CIcon icon={cibGoogle} id="google-signup-icon" />
                    <span id="google-signup-text">Sign up with google</span>
                </span>
            </div>

            <div className="or-box">
                <hr style={{ backgroundColor: "#bbc2c9" }} />
                <div className="or-div">or</div>
            </div>

            <div id="create-box"><span>Create Account</span></div>

            <div className="bottom-text">
                Have an account already? <span style={{ color: "#1DA1F2" }}>Log in</span>
            </div>
        </>
    )

    return (
        <CustomModal bodyJSX={registerBodyJSX} />
    )
}

export default Register;

