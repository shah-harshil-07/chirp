import "src/styles/auth.css";
import "src/styles/signupSteps/create-account.css";

import React from "react";

const CreateAccount = ({ goToNextStep }) => {
    return (
        <div id="cred-modal">
            <h4 className="header">Create your account</h4>
            <input type="text" className="create-account-input" placeholder="Name" />
            <input type="text" className="create-account-input" placeholder="Username" />
            <input type="text" className="create-account-input" placeholder="Email" />
        </div>
    )
}

export default CreateAccount;
