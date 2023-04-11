import "src/styles/auth.css";
import "src/styles/signup-steps/create-account.css";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import LabelledInput from "../labelled-input";

const CreateAccount = forwardRef(({ handleDataChange }, ref) => {
    const initialData = { name: '', username: '', email: '', password: '', confirmPassword: '', noteChecked: false };
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    useEffect(() => {
        handleDataChange(data);
    }, [data]);

    useImperativeHandle(ref, () => {
        return {
            updateErrorInfo: errorObj => {
                setErrors({ ...errorObj });
            }
        }
    }, []);

    const handleInputChange = (key, value) => {
        setData({ ...data, [key]: value });
    }

    return (
        <div id="animated-body">
            <h4 className="header">Create your account</h4>
            <br />

            <h6 className="text-danger"><i>All inputs are required.</i></h6>

            <div className="position-relative">
                <LabelledInput
                    value={data["name"]}
                    handleChange={value => handleInputChange("name", value)}
                    header={"Name"}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <LabelledInput
                    extraClasses="create-account-input"
                    value={data["username"]}
                    handleChange={value => handleInputChange("username", value)}
                    header={"Username"}
                />
                <p className="text-danger create-account-text">{errors["username"]}</p>

                <LabelledInput
                    extraClasses="create-account-input"
                    value={data["email"]}
                    handleChange={value => handleInputChange("email", value)}
                    header={"Email"}
                />
                <p className="text-danger create-account-text">{errors["email"]}</p>

                <LabelledInput
                    extraClasses="create-account-input"
                    value={data["password"]}
                    handleChange={value => handleInputChange("password", value)}
                    header={"Password"}
                    type={"password"}
                />
                <p className="text-danger create-account-text">{errors["password"]}</p>

                <LabelledInput
                    extraClasses="create-account-input"
                    value={data["confirmPassword"]}
                    handleChange={value => handleInputChange("confirmPassword", value)}
                    header={"Confirm Password"}
                    type={"password"}
                />
                <p className="text-danger create-account-text">{errors["confirmPassword"]}</p>

                <div style={{ marginTop: "38px" }}>
                    <input
                        type="checkbox"
                        defaultChecked={data["noteChecked"]}
                        onChange={() => handleInputChange("noteChecked", !data["noteChecked"])}
                    />

                    <span style={{ opacity: data["noteChecked"] ? 1 : 0.5, marginLeft: "5px", marginTop: "30px" }}>
                        Chirp uses your data to personalize your experience. By signing up, you agree to our terms and
                        conditions, privacy policy & cookie use.
                    </span>
                </div>
            </div>
        </div>
    )
});

export default CreateAccount;
