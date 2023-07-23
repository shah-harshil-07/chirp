import "src/styles/auth.css";
import "src/styles/signup-steps/create-account.css";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import LabelledInput from "../utilities/labelled-input";

const CreateAccount = forwardRef(({ handleDataChange }, ref) => {
    const initialData = { name: '', username: '', email: '', password: '', confirmPassword: '', noteChecked: false };
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);

    useEffect(() => {
        handleDataChange(data);
        // eslint-disable-next-line
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
                    header={"Name"}
                    value={data["name"]}
                    handleChange={value => handleInputChange("name", value)}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <LabelledInput
                    extraClasses="mt-3"
                    header={"Username"}
                    value={data["username"]}
                    handleChange={value => handleInputChange("username", value)}
                />
                <p className="text-danger create-account-text">{errors["username"]}</p>

                <LabelledInput
                    header={"Email"}
                    extraClasses="mt-3"
                    value={data["email"]}
                    handleChange={value => handleInputChange("email", value)}
                />
                <p className="text-danger create-account-text">{errors["email"]}</p>

                <LabelledInput
                    type={"password"}
                    extraClasses="mt-3"
                    header={"Password"}
                    value={data["password"]}
                    handleChange={value => handleInputChange("password", value)}
                />
                <p className="text-danger create-account-text">{errors["password"]}</p>

                <LabelledInput
                    type={"password"}
                    extraClasses="mt-3"
                    header={"Confirm Password"}
                    value={data["confirmPassword"]}
                    handleChange={value => handleInputChange("confirmPassword", value)}
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
