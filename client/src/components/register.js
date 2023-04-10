import "src/styles/auth.css";
import "src/styles/register.css";

import React, { useEffect, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "./custom-modal";
import { openModal, closeModal } from "src/actions/modal";
import CreateAccount from "./signup-steps/create-account";
import KeyNote from "./signup-steps/key-note";
import Verification from "./signup-steps/verification";
import CodeInput from "./signup-steps/code-input";
import PasswordInput from "./signup-steps/password-input";
import { validate, getErrorMessage } from "src/helpers";
import API from "src/api";
import * as Constants from "src/constants";

const Register = () => {
    const initialBodyData = {
        password: '',
        codeInput: '',
        keyNoteChecked: false,
        createAccount: { name: '', username: '', email: '' },
    };
    const [bodyData, setBodyData] = useState(initialBodyData);

    const createAccountRef = useRef(null);

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
        {
            footer: true,
            footerText: "Next",
            bodyKey: "createAccount",
            component: (
                <CreateAccount
                    ref={createAccountRef}
                    handleDataChange={data => handleBodyDataChange("createAccount", data)}
                />
            ),
        },
        {
            footer: true,
            footerText: "Next",
            bodyKey: "keyNoteChecked",
            component: <KeyNote handleDataChange={data => handleBodyDataChange("keyNoteChecked", data)} />,
        },
        { footer: true, footerText: "Next", component: <Verification data={bodyData.createAccount} />, },
        {
            footer: true,
            footerText: "Next",
            bodyKey: "codeInput",
            component: (
                <CodeInput
                    resendOtpMail={() => sendOtpMail()}
                    email={bodyData.createAccount.email}
                    handleDataChange={data => handleBodyDataChange("codeInput", data)}
                />
            ),
        },
        {
            footer: true,
            bodyKey: "password",
            footerText: "Finish",
            component: <PasswordInput handleDataChange={data => handleBodyDataChange("password", data)} />,
        }
    ];

    const dispatch = useDispatch();

    const [bodyJSX, setBodyJSX] = useState(<></>);
    const [signUpStep, setSignUpStep] = useState(0);
    const [includeFooter, setIncludeFooter] = useState(false);
    const [footerText, setFooterText] = useState('');
    const [bodyKey, setBodyKey] = useState('');
    const [footerDisabled, setFooterDisabled] = useState(true);
    const [otpId, setOtpId] = useState('');
    const [password, setPassword] = useState('');
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        const _bodyJSX = bodyJSXList?.[signUpStep]?.component ?? <></>;
        const _includeFooter = bodyJSXList?.[signUpStep]?.footer ?? false;
        const _footerText = bodyJSXList?.[signUpStep]?.footerText ?? '';
        const _bodyKey = bodyJSXList?.[signUpStep]?.bodyKey ?? '';
        const _footerDisabled = (signUpStep === 3) ? false : true;

        if (signUpStep === 4) {
            setShowLoader(true);
            sendOtpMail();
            setFooterDisabled(true);
            return;
        }

        setBodyJSX(_bodyJSX);
        setIncludeFooter(_includeFooter);
        setFooterText(_footerText);
        setBodyKey(_bodyKey);
        setFooterDisabled(_footerDisabled);
    }, [signUpStep]);

    useEffect(() => {
        if (otpId && signUpStep === 4) {
            setBodyJSX(bodyJSXList?.[4]?.component ?? <></>);
            setIncludeFooter(bodyJSXList?.[4]?.footer ?? false);
            setFooterText(bodyJSXList?.[4]?.footerText ?? '');
            setBodyKey(bodyJSXList?.[4]?.bodyKey ?? '');
        }
    }, [otpId]);

    useEffect(() => {
        let data = bodyData?.[bodyKey], formIsValid = true, _errors = {};

        switch (bodyKey) {
            case "createAccount":
                if (data) {
                    formIsValid = true;

                    for (const key in data) {
                        if (!data[key]) {
                            formIsValid = false;
                        } else if (validate(key, data[key])) {
                            _errors[key] = getErrorMessage(key);
                            formIsValid = false;
                        } else {
                            _errors[key] = '';
                        }
                    }

                    if (createAccountRef?.current) createAccountRef.current.updateErrorInfo(_errors);
                    setFooterDisabled(!formIsValid);
                }

                break;
            case "keyNoteChecked":
                setFooterDisabled(!data);
                break;
            case "codeInput":
                if (data.length === 4) verifyOtp(data);
                else setFooterDisabled(true);
                break;
            case "password":
                setFooterDisabled(!validate("password", data));
                setPassword(data);
                break;
            default:
                break;
        }
    }, [bodyData]);

    const sendOtpMail = async () => {
        const data = bodyData.createAccount;

        try {
            const response = await API(Constants.POST, Constants.GET_OTP, data);
            setShowLoader(false);
            const responseData = response.data;
            if (responseData?.meta?.status && responseData?.data?.otpId) setOtpId(responseData.data.otpId);
        } catch (error) {
            console.log(error);
            setShowLoader(false);
        }
    }

    const verifyOtp = async otp => {
        const data = { otp };

        try {
            const response = await API(Constants.POST, `${Constants.VERIFY_OTP}/${otpId}`, data);

            if (response?.data?.data) {
                const _footerDisabled =  !(response?.data?.data?.valid);
                if (!_footerDisabled) setSignUpStep(signUpStep + 1);
            }
        } catch (error) {
            console.log(error);
            setFooterDisabled(true);
        }
    }

    const applyFinalRegisteration = async () => {
        setShowLoader(true);
        const data = { ...bodyData.createAccount, password };

        try {
            await API(Constants.POST, Constants.REGISTER, data);
            setShowLoader(false);
            closeRegisterDialog();
        } catch (error) {
            console.log(error);
            setShowLoader(false);
        }
    }

    const closeRegisterDialog = () => {
        dispatch(closeModal());
    }

    function openLoginDialog() {
        dispatch(openModal("login"));
    }

    function openNextSignUpStep() {
        if (signUpStep === bodyJSXList.length - 1) applyFinalRegisteration();
        else setSignUpStep(signUpStep + 1);
    }

    function handleBodyDataChange(key, data) {
        setBodyData({ ...bodyData, [key]: data });
    }

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            footerText={footerText}
            includeFooter={includeFooter}
            footerDisabled={footerDisabled}
            footerAction={openNextSignUpStep}
            showLoader={showLoader}
        />
    )
}

export default Register;
