import "src/styles/auth.css";
import "./index.css";

import React from "react";

const CreateAccount = () => {
    return (
        <div id="cred-modal">
            <h4 className="header">Create your account</h4>
            <input type="text" className="auth-box" placeholder="Name" />
            <input type="text" className="auth-box" placeholder="Username" />
            <input type="text" className="auth-box" placeholder="Email" />

            <div className="auth-box" id="forgot-box" style={{ marginTop: "70px" }}>
                <span className="d-flex justify-content-center align-items-end auth-text">Next</span>
            </div>
        </div>
    )
}

export default CreateAccount;
