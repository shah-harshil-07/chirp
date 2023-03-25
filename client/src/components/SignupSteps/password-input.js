import React from "react";
import LabelledInput from "../labelled-input";

const PasswordInput = () => {
    return (
        <div id="animated-body">
            <h4><b>You'll need a password</b></h4>
            <p style={{ color: "GrayText" }}>Make sure it is more than 8 characters</p>

            <LabelledInput />
        </div>
    );
}

export default PasswordInput;

