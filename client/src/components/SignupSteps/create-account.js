import "src/styles/auth.css";
import "src/styles/signupSteps/create-account.css";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const CreateAccount = forwardRef(({ handleDataChange }, ref) => {
    const initialData = { name: '', username: '', email: '' };
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
                <input
                    type="text"
                    placeholder="Name"
                    value={data["name"]}
                    className="create-account-input"
                    style={{ marginTop: "2px" }}
                    onChange={e => handleInputChange("name", e.target.value)}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <input
                    type="text"
                    placeholder="Username"
                    value={data["username"]}
                    className="create-account-input"
                    onChange={e => handleInputChange("username", e.target.value)}
                />
                <p className="text-danger create-account-text">{errors["username"]}</p>

                <input
                    type="text"
                    placeholder="Email"
                    value={data["email"]}
                    className="create-account-input"
                    onChange={e => handleInputChange("email", e.target.value)}
                />
                <p className="text-danger create-account-text">{errors["email"]}</p>
            </div>
        </div>
    )
});

export default CreateAccount;
