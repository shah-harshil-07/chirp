import "src/styles/auth.css";
import "src/styles/signupSteps/create-account.css";

import React, { useEffect, useState } from "react";

const CreateAccount = ({ sampleData, handleDataChange }) => {
    const initialData = { name: '', username: '', email: '' };
    const [data, setData] = useState(initialData);

    useEffect(() => {
        setData({
            name: sampleData?.name ?? initialData.name,
            username: sampleData?.username ?? initialData.username,
            email: sampleData?.email ?? initialData.email
        });
    }, [sampleData]);

    useEffect(() => {
        handleDataChange(data);
    }, [data]);

    const handleInputChange = (key, value) => {
        setData({ ...data, [key]: value });
    }

    return (
        <div id="animated-body">
            <h4 className="header">Create your account</h4>

            <input
                type="text"
                placeholder="Name"
                value={data["name"]}
                className="create-account-input"
                onChange={e => handleInputChange("name", e.target.value)}
            />

            <input
                type="text"
                placeholder="Username"
                value={data["username"]}
                className="create-account-input"
                onChange={e => handleInputChange("username", e.target.value)}
            />

            <input
                type="text"
                placeholder="Email"
                value={data["email"]}
                className="create-account-input"
                onChange={e => handleInputChange("email", e.target.value)}
            />
        </div>
    )
}

export default CreateAccount;
