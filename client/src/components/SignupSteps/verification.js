import "src/styles/signupSteps/verification.css";

import React from "react";

const Verification = ({ data }) => {
    return (
        <div id="animated-body">
            <h4><b>Create your account</b></h4>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Name</label>
                <p style={{ marginTop: "-9.5px" }}>{data?.name ?? ''}</p>
            </div>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Username</label>
                <p style={{ marginTop: "-9.5px" }}>{data?.username ?? ''}</p>
            </div>

            <div className="verification-box">
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "GrayText" }}>Email</label>
                <p style={{ marginTop: "-9.5px" }}>{data?.email ?? ''}</p>
            </div>
        </div>
    );
}

export default Verification;

