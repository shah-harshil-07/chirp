import "src/styles/auth.css";
import "src/styles/cred-input.css";

import React from "react";

const CredInput = () => {
    return (
        <div id="animated-body">
            <h4 className="header">Enter your password</h4>
            <input type="text" disabled={true} className="auth-box" id="username-box" value="Hello World" />
            <input type="text" className="auth-box" id="password-box" placeholder="Password" />
        </div>
    )
}

export default CredInput;
