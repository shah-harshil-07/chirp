import React from "react";
import LabelledInput from "../labelled-input";

const CodeInput = () => {
    return (
        <div id="animated-body">
            <h4><b>We sent you a code</b></h4>
            <p style={{ color: "GrayText" }}>Enter it below to verify xyz@yopmail.com</p>

            <LabelledInput />

            <p style={{ textDecoration: "underline", color: "#1DA1F2", marginTop: "5px" }}>Resend email</p>
        </div>
    );
}

export default CodeInput;
