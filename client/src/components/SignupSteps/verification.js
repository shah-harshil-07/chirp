import "src/styles/signupSteps/verification.css";

import React from "react";

const Verification = ({ goToNextStep }) => {
    return (
        <>
            <h4><b>Create your account</b></h4>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Name</label>
                <p style={{ marginTop: "-9.5px" }}>Hello World</p>
            </div>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Username</label>
                <p style={{ marginTop: "-9.5px" }}>Hello World</p>
            </div>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Email</label>
                <p style={{ marginTop: "-9.5px" }}>Hello World</p>
            </div>
        </>
    );
}

export default Verification;

