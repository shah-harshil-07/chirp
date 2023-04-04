import React, { useEffect, useState } from "react";
import LabelledInput from "../labelled-input";

const CodeInput = ({ email, handleDataChange }) => {
    const [code, setCode] = useState('');
    const [seconds, setSeconds] = useState(20);

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) setSeconds(seconds - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    useEffect(() => {
        handleDataChange(code);
    }, [code]);

    return (
        <div id="animated-body">
            <h4><b>We sent you a code</b></h4>
            <p style={{ color: "GrayText" }}>Enter it below to verify {email}</p>
            <p className={seconds === 0 ? "text-danger" : ''}>
                <b>{seconds > 0 ? `The OTP expires in: ${seconds} seconds` : "The OTP has expired!"}</b>
            </p>

            <LabelledInput value={code} handleChange={value => setCode(value)} header={"Code"} />

            <p style={{ textDecoration: "underline", color: "#1DA1F2", marginTop: "5px" }}>Resend email</p>
        </div>
    );
}

export default CodeInput;

