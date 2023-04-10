import "src/styles/signup-steps/verification.css";

import React from "react";

const Verification = ({ data }) => {
    return (
        <div id="animated-body">
            <h4><b>Create your account</b></h4>

            <div className="verification-box">
                <label className="verification-label">Name</label>
                <p className="verification-value">{data?.name ?? ''}</p>
            </div>

            <div className="verification-box">
                <label className="verification-label">Username</label>
                <p className="verification-value">{data?.username ?? ''}</p>
            </div>

            <div className="verification-box">
                <label className="verification-label">Email</label>
                <p className="verification-value">{data?.email ?? ''}</p>
            </div>
        </div>
    );
}

export default Verification;

