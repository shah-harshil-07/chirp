import "src/styles/auth.css";
import "src/styles/register.css";

import React, { useEffect, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "../CustomModal";
import { openModal, closeModal } from "src/actions/modal";
import CreateAccount from "../SignupSteps/create-account";
import KeyNote from "../SignupSteps/key-note";
import Verification from "../SignupSteps/verification";
import CodeInput from "../SignupSteps/code-input";
import PasswordInput from "../SignupSteps/password-input";

const Register = () => {
    const registerBodyJSX = (
        <>
            <h4 className="header">Join Chirp today</h4>

            <div className="auth-box">
                <span className="d-flex justify-content-center align-items-center">
                    <CIcon icon={cibGoogle} id="google-signup-icon" />
                    <span id="google-signup-text">Sign up with google</span>
                </span>
            </div>

            <div className="or-box">
                <hr style={{ backgroundColor: "#bbc2c9" }} />
                <div className="or-div">or</div>
            </div>

            <div className="auth-box" id="create-box" onClick={openNextSignUpStep}>
                <span>Create Account</span>
            </div>

            <div className="bottom-text">
                Have an account already? 
                <span className="link-text" onClick={openLoginDialog}>{` Log in`}</span>
            </div>
        </>
    );

    const bodyJSXList = [
        { component: registerBodyJSX, footer: false },
        { component: <CreateAccount goToNextStep={openNextSignUpStep} />, footer: true, footerText: "Next" },
        { component: <KeyNote goToNextStep={openNextSignUpStep} />, footer: true, footerText: "Next" },
        { component: <Verification goToNextStep={openNextSignUpStep} />, footer: true, footerText: "Next" },
        { component: <CodeInput goToNextStep={openNextSignUpStep} />, footer: true, footerText: "Next" },
        { component: <PasswordInput />, footer: true, footerText: "Finish" }
    ];

    const dispatch = useDispatch();
    const [bodyJSX, setBodyJSX] = useState(<></>);
    const [signUpStep, setSignUpStep] = useState(0);
    const [includeFooter, setIncludeFooter] = useState(false);
    const [footerText, setFooterText] = useState('');

    useEffect(() => {
        const _bodyJSX = bodyJSXList?.[signUpStep]?.component ?? <></>;
        const _includeFooter = bodyJSXList?.[signUpStep]?.footer ?? false;
        const _footerText = bodyJSXList?.[signUpStep]?.footerText ?? '';

        setBodyJSX(_bodyJSX);
        setIncludeFooter(_includeFooter);
        setFooterText(_footerText);
    }, [signUpStep]);

    const closeRegisterDialog = () => {
        dispatch(closeModal());
    }

    function openLoginDialog() {
        dispatch(openModal("login"));
    }

    function openNextSignUpStep() {
        if (signUpStep === bodyJSXList.length - 1) closeRegisterDialog();
        else setSignUpStep(signUpStep + 1);
    }

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            includeFooter={includeFooter}
            footerAction={openNextSignUpStep}
            footerText={footerText}
        />
    )
}

export default Register;
