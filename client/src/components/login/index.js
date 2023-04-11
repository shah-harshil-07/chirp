import "src/styles/auth.css";
import "src/styles/login.css";

import React, { useEffect, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "../custom-modal";
import CredInput from "./cred-input";
import { openModal, closeModal } from "src/actions/modal";
import LabelledInput from "../labelled-input";

const Login = () => {
    const [cred, setCred] = useState('');
    const [password, setPassword] = useState('');

    const loginBodyJSX = (
        <>
            <h4 className="header">Sign in to Chirp</h4>

            <div className="auth-box">
                <span className="d-flex justify-content-center align-items-center">
                    <CIcon icon={cibGoogle} id="google-signup-icon" />
                    <span id="google-signup-text">Sign in with google</span>
                </span>
            </div>

            <div className="or-box">
                <hr style={{ backgroundColor: "#bbc2c9" }} />
                <div className="or-div">or</div>
            </div>

            <LabelledInput value={cred} handleChange={data => { setCred(data) }} header={"Email or Username"} />

            <LabelledInput
                value={password}
                handleChange={data => { setPassword(data) }}
                header={"Password"}
                type={"password"}
                extraClasses={"mt-3"}
            />

            <div className="auth-box" id="login-next-box" onClick={openNextLoginStep}>
                <span className="d-flex justify-content-center align-items-end auth-text">Login</span>
            </div>

            <div className="bottom-text">
                Don't have an account?
                <span className="link-text" onClick={openRegisterDialog}>{` Sign up`}</span>

                <span className="link-text" style={{ float: "right" }}>Forgot Password?</span>
            </div>
        </>
    );

    const dispatch = useDispatch();

    const bodyJSXList = [
        { component: loginBodyJSX, footer: false },
        { component: <CredInput goToNextStep={openNextLoginStep} />, footer: true, footerText: "Login" },
    ];

    const [loginStep, setLoginStep] = useState(0);
    const [bodyJSX, setBodyJSX] = useState(<></>);
    const [includeFooter, setIncludeFooter] = useState(false);
    const [footerText, setFooterText] = useState('');

    useEffect(() => {
        let _bodyJSX = bodyJSXList?.[loginStep]?.component ?? <></>;
        const _includeFooter = bodyJSXList?.[loginStep]?.footer ?? false;
        const _footerText = bodyJSXList?.[loginStep]?.footerText ?? '';

        setBodyJSX(_bodyJSX);
        setIncludeFooter(_includeFooter);
        setFooterText(_footerText);
    }, [loginStep]);

    function openRegisterDialog() {
        dispatch(openModal("register"));
    }

    function closeLoginDialog() {
        dispatch(closeModal());
    }

    function openNextLoginStep() {
        if (loginStep < bodyJSXList.length - 1) setLoginStep(loginStep + 1);
        else closeLoginDialog();
    }

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            includeFooter={includeFooter}
            footerText={footerText}
            footerAction={openNextLoginStep}
        />
    )
}

export default Login;
