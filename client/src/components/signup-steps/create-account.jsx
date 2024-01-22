import "src/styles/auth.css";
import "src/styles/signup-steps/create-account.css";

import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilLockUnlocked } from "@coreui/icons";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import LabelledInput from "../utilities/labelled-input";

const CreateAccount = forwardRef(({ handleDataChange }, ref) => {
    const initialData = { name: '', username: '', email: '', password: '', confirmPassword: '', noteChecked: false };
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);
    const [passwordLocked, setPasswordLocked] = useState(true);
    const [confirmPasswordLocked, setConfirmedPasswordLocked] = useState(true);

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
                    tabIndex={1}
                    header={"Name"}
                    value={data["name"]}
                    handleChange={value => handleInputChange("name", value)}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <LabelledInput
                    tabIndex={2}
                    extraClasses="mt-3"
                    header={"Username"}
                    value={data["username"]}
                    handleChange={value => handleInputChange("username", value)}
                />
                <p className="text-danger create-account-text">{errors["username"]}</p>

                <LabelledInput
                    tabIndex={3}
                    header={"Email"}
                    extraClasses="mt-3"
                    value={data["email"]}
                    handleChange={value => handleInputChange("email", value)}
                />
                <p className="text-danger create-account-text">{errors["email"]}</p>

                <div className="position-relative">
                    <LabelledInput
                        tabIndex={4}
                        extraClasses="mt-3"
                        header={"Password"}
                        value={data["password"]}
                        type={passwordLocked ? "password" : "text"}
                        handleChange={value => handleInputChange("password", value)}
                    />

                    <CIcon
                        size="sm"
                        className="pwd-eye"
                        onClick={() => setPasswordLocked(!passwordLocked)}
                        icon={passwordLocked ? cilLockLocked : cilLockUnlocked}
                    />

                    <p className="text-danger create-account-text">{errors["password"]}</p>
                </div>

                <div className="position-relative">
                    <LabelledInput
                        tabIndex={4}
                        extraClasses="mt-3"
                        header={"Confirm Password"}
                        value={data["confirmPassword"]}
                        type={confirmPasswordLocked ? "password" : "text"}
                        handleChange={value => handleInputChange("confirmPassword", value)}
                    />

                    <CIcon
                        size="sm"
                        className="pwd-eye"
                        icon={confirmPasswordLocked ? cilLockLocked : cilLockUnlocked}
                        onClick={() => setConfirmedPasswordLocked(!confirmPasswordLocked)}
                    />

                    <p className="text-danger create-account-text">{errors["confirmPassword"]}</p>
                </div>

                <div style={{ marginTop: "38px" }}>
                    <input
                        tabIndex={5}
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
