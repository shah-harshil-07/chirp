import "./index.css";

import React from "react";

const AuthBar = () => {
    return (
        <div id="auth-bar" className="row">
            <div style={{ marginLeft: "35%" }}>
                <div style={{ fontWeight: "bolder", fontSize: "20px", color: "white" }}>Don't miss what's happening</div><br />
                <div style={{ fontSize: "13px", color: "white", marginTop: "-28px" }}>People on Chirp are first to know</div>
            </div>

            <div style={{ marginRight: "14%", marginTop: "-35px" }}>
                <div className="auth-btn" id="signup-btn"><span style={{ fontSize: "11px" }}>Sign Up</span></div>
                <div className="auth-btn" id="login-btn"><span style={{ fontSize: "11px" }}>Log in</span></div>
            </div>
        </div>
    )
}

export default AuthBar;
