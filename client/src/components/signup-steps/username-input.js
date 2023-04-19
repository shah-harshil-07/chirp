import "src/styles/signup-steps/code-input.css";

import React, { useState } from "react";

import LabelledInput from "../utilities/labelled-input";
import * as Constants from "src/constants";
import { validate } from "src/helpers";

const UsernameInput = () => {
    const [username, setUsername] = useState('');
    const [errMessage, setErrMessage] = useState('');

    const handleDataChange = value => {
        let _errMessage = '';

        if (validate("username", value)) _errMessage = Constants.USERNAME_ERR_MESSAGE;
        else _errMessage = '';

        setUsername(value);
        setErrMessage(_errMessage);
    }

    return (
        <div id="animated-body">
            <h4><b>What should we call you?</b></h4>
            <p id="verification-para">Please specify a username.</p>
            <LabelledInput value={username} handleChange={value => handleDataChange(value)} header={"Username"} />
            <p className="text-danger">{errMessage}</p>
        </div>
    );
}

export default UsernameInput;

