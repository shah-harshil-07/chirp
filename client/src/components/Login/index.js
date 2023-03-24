import "src/styles/auth.css";

import React, { useEffect, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "../CustomModal";
import CredInput from "./cred-input";
import { openModal, closeModal } from "src/actions/modal";

const Login = () => {
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

            <input type="text" placeholder="Phone, email or username" className="input-text" />

            <div className="auth-box" id="next-box" onClick={openNextLoginStep}>
                <span className="d-flex justify-content-center align-items-end auth-text">Next</span>
            </div>

            <div className="auth-box" id="forgot-box">
                <span className="d-flex justify-content-center align-items-end auth-text">Forgot Password?</span>
            </div>

            <div className="bottom-text">
                Don't have an account?
                <span className="link-text" onClick={openRegisterDialog}>{` Sign up`}</span>
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
