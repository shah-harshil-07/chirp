import "src/styles/auth.css";
import "./cred-input.css";

import React from "react";

const CredInput = () => {
    return (
        <div id="cred-modal">
            <h4 className="header">Enter your password</h4>
            <input type="text" disabled={true} className="auth-box" id="username-box" value="Hello World" />
            <input type="text" className="auth-box" id="password-box" placeholder="Password" />

            <div className="auth-box" id="forgot-box" style={{ marginTop: "70px" }}>
                <span className="d-flex justify-content-center align-items-end auth-text">Login</span>
            </div>
        </div>
    )
}

export default CredInput;
