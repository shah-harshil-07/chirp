import "src/styles/signup-steps/code-input.css";

import React, { useEffect, useState } from "react";

import LabelledInput from "../utilities/labelled-input";

const CodeInput = ({ email, handleDataChange, resendOtpMail }) => {
    const [code, setCode] = useState('');
    const [seconds, setSeconds] = useState(60);

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) setSeconds(seconds - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    useEffect(() => {
        handleDataChange(code);
        // eslint-disable-next-line
    }, [code]);

    const handleCodeChange = value => {
        if (value.length > 4) value = value.slice(0, 4);
        setCode(value);
    }

    const restartOtpVerification = () => {
        if (seconds <= 0) {
            setCode('');
            setSeconds(40);
            resendOtpMail();
        }
    }

    return (
        <div id="animated-body">
            <h4><b>We sent you a code</b></h4>

            <p id="verification-para">Enter it below to verify {email}</p>

            <p className={seconds === 0 ? "text-danger" : ''}>
                <b>{seconds > 0 ? `The OTP expires in: ${seconds} seconds` : "The OTP has expired!"}</b>
            </p>

            <LabelledInput disabled={!seconds} value={code} handleChange={value => handleCodeChange(value)} header={"Code"} />

            <p
                id="resend-mail-link"
                style={{ opacity: seconds > 0 ? '0.5' : '1' }}
                onClick={restartOtpVerification}
            >
                Resend email
            </p>
        </div>
    );
}

export default CodeInput;

