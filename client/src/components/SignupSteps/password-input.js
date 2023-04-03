import React, { useState, useEffect } from "react";
import LabelledInput from "../labelled-input";

const PasswordInput = ({ handleDataChange }) => {
    const [password, setPassword] = useState('');

    useEffect(() => {
        handleDataChange(password);
    }, [password]);

    return (
        <div id="animated-body">
            <h4><b>You'll need a password</b></h4>

            <p style={{ color: "GrayText" }}>
                Make sure it is more than 8 characters, has atleast one lowercase, one uppercase and special character.
            </p>

            <LabelledInput value={password} handleChange={value => setPassword(value)} header={"Password"} />
        </div>
    );
}

export default PasswordInput;

