import "src/styles/auth.css";
import "src/styles/register.css";

import React, { useEffect, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";

import CustomModal from "./utilities/custom-modal";
import { openModal, closeModal } from "src/actions/modal";
import CreateAccount from "./signup-steps/create-account";
import CodeInput from "./signup-steps/code-input";
import { validate, getErrorMessage } from "src/helpers";
import API from "src/api";
import * as Constants from "src/constants";
import { openToaster } from "src/actions/toaster";
import UsernameInput from "./signup-steps/username-input";

const Register = () => {
    const initialBodyData = {
        codeInput: '',
        createAccount: { name: '', username: '', email: '', password: '', confirmPassword: '', noteChecked: false },
    };
    const [bodyData, setBodyData] = useState(initialBodyData);

    const createAccountRef = useRef(null);

    const registerBodyJSX = (
        <>
            <h4 className="header">Join Chirp today</h4>

            <div className="auth-box">
                <span className="d-flex justify-content-center align-items-center" onClick={() => registerWithGoogle()}>
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
        { footer: false, component: registerBodyJSX },
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
            footerText: "Finish",
            bodyKey: "codeInput",
            component: (
                <CodeInput
                    resendOtpMail={() => sendOtpMail()}
                    email={bodyData.createAccount.email}
                    handleDataChange={data => handleBodyDataChange("codeInput", data)}
                />
            ),
        },
    ];

    const dispatch = useDispatch();

    const [bodyJSX, setBodyJSX] = useState(<></>);
    const [signUpStep, setSignUpStep] = useState(0);
    const [includeFooter, setIncludeFooter] = useState(false);
    const [footerText, setFooterText] = useState('');
    const [bodyKey, setBodyKey] = useState('');
    const [footerDisabled, setFooterDisabled] = useState(true);
    const [otpId, setOtpId] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [displayOverflow, setDisplayOverFlow] = useState(false);
    const [googleRegisteredUser, setGoogleRegisteredUser] = useState(null);
    const [isGoogleAuthedUsernameValid, setIsGoogleAuthedUsernameValid] = useState(false);

    useEffect(() => {
        if (signUpStep === bodyJSXList.length) {
            applyFinalRegisteration();
        } else {
            const _bodyJSX = bodyJSXList?.[signUpStep]?.component ?? <></>;
            const _includeFooter = bodyJSXList?.[signUpStep]?.footer ?? false;
            const _footerText = bodyJSXList?.[signUpStep]?.footerText ?? '';
            const _bodyKey = bodyJSXList?.[signUpStep]?.bodyKey ?? '';
            const _footerDisabled = (signUpStep === 3) ? false : true;
            const _displayOverflow = (signUpStep === 1) ? true : false;

            setBodyJSX(_bodyJSX);
            setIncludeFooter(_includeFooter);
            setFooterText(_footerText);
            setBodyKey(_bodyKey);
            setFooterDisabled(_footerDisabled);
            setDisplayOverFlow(_displayOverflow);

            if (signUpStep === 2) {
                setShowLoader(true);
                checkUserUniqueness();
                setFooterDisabled(true);
            }
        }
    }, [signUpStep]);

    useEffect(() => {
        if (otpId && signUpStep === 2) {
            setBodyJSX(bodyJSXList?.[2]?.component ?? <></>);
            setIncludeFooter(bodyJSXList?.[2]?.footer ?? false);
            setFooterText(bodyJSXList?.[2]?.footerText ?? '');
            setBodyKey(bodyJSXList?.[2]?.bodyKey ?? '');
        }
    }, [otpId]);

    useEffect(() => {
        let data = bodyData?.[bodyKey], formIsValid = true, _errors = {};

        switch (bodyKey) {
            case "createAccount":
                if (data) {
                    formIsValid = true;

                    for (const key in data) {
                        const value = data[key];

                        if (!value) {
                            formIsValid = false;
                        } else if (validate(key, value)) {
                            _errors[key] = getErrorMessage(key);
                            formIsValid = false;
                        } else if (key === "confirmPassword" && value && value !== data["password"]) {
                            _errors[key] = Constants.CONFIRM_PASSWORD_MESSAGE;
                            formIsValid = false;
                        } else {
                            _errors[key] = '';
                        }
                    }

                    if (createAccountRef?.current) createAccountRef.current.updateErrorInfo(_errors);
                    setFooterDisabled(!formIsValid);
                }

                break;
            case "codeInput":
                if (data.length === 4) verifyOtp(data);
                else setFooterDisabled(true);
                break;
            default:
                break;
        }
    }, [bodyData]);

    useEffect(async () => {
        if (googleRegisteredUser) {
            const token = googleRegisteredUser.access_token;
            const headerData = { Accept: "application/json", Authorization: `Bearer ${token}` };

            try {
                const requestUrl = `${Constants.GOOGLE_USER_VERIFICATION}?access_token=${token}`;
                const response = await API(Constants.GET, requestUrl, null, headerData, true);

                if (response.status === 200 && response.data) {
                    const name = response?.data?.name ?? '';
                    const email = response?.data?.email ?? '';
                    const googleId = response?.data?.id ?? '';
                    checkGoogleAuthedUser({ name, email, googleId });
                }
            } catch (error) {
                dispatch(openToaster("Error", "Something went wrong!"));
                setGoogleRegisteredUser(null);
            }
        }
    }, [googleRegisteredUser]);

    useEffect(() => {
        console.log("isGoogleAuthedUsernameValid useEffect called!");
        if (footerText === "Set Username") setFooterDisabled(!isGoogleAuthedUsernameValid);
    }, [isGoogleAuthedUsernameValid]);

    const registerWithGoogle = useGoogleLogin({
        onSuccess: response => { setGoogleRegisteredUser(response) },
        onError: err => { console.log(err) },
    });

    const checkUserUniqueness = async () => {
        const data = {
            name: bodyData.createAccount.name,
            email: bodyData.createAccount.email,
            username: bodyData.createAccount.username,
        };

        try {
            const response = await API(Constants.POST, Constants.CHECK_USER_CREDENTIALS, data);
            const responseData = response.data;

            if (responseData.meta.status && responseData.data) {
                if (responseData.data.userUnique) {
                    sendOtpMail();
                } else {
                    setShowLoader(false);
                    const errorMessage = responseData?.meta?.message ?? "Something went wrong!";
                    dispatch(openToaster("Error", errorMessage));
                    setSignUpStep(1);
                }
            } else {
                setShowLoader(false);
                setSignUpStep(1);
                dispatch(openToaster("Error", "Something went wrong!"));
            }
        } catch (error) {
            console.log(error);
            setShowLoader(false);
            dispatch(openToaster("Error", "Something went wrong!"));
            setSignUpStep(1);
        }
    }

    const checkGoogleAuthedUser = async userData => {
        try {
            const response = await API(Constants.POST, Constants.CHECK_GOOGLE_CREDENTIALS, userData);
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data) {
                const message = responseData?.meta?.message ?? "User Already exists.";

                if (responseData.data.userAvailable) {
                    closeRegisterDialog();
                    dispatch(openToaster("Error", message));
                } else {
                    showUserInputPage();
                }
            } else if (responseData?.error?.message) {
                dispatch(openToaster("Error", responseData.error.message));
            }
        } catch (error) {
            console.log(error);
            dispatch(openToaster("Error", "Something went wrong!"));
            closeRegisterDialog();
        }
    }

    const sendOtpMail = async () => {
        const data = {
            name: bodyData.createAccount.name,
            email: bodyData.createAccount.email,
            username: bodyData.createAccount.username,
        };

        try {
            const response = await API(Constants.POST, Constants.GET_OTP, data);
            setShowLoader(false);
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data?.otpId) {
                setOtpId(responseData.data.otpId);
            } else if (!responseData?.meta?.status) {
                const errorMessage = responseData?.error?.message ?? "Something went wrong!";
                dispatch(openToaster("Error", errorMessage));
            }
        } catch (error) {
            console.log(error);
            setShowLoader(false);
            dispatch(openToaster("Error", "Something went wrong!"));
        }
    }

    const verifyOtp = async otp => {
        const data = { otp };

        try {
            const response = await API(Constants.POST, `${Constants.VERIFY_OTP}/${otpId}`, data);

            if (response?.data?.data) {
                const _footerDisabled = !(response?.data?.data?.valid);
                if (!_footerDisabled) setSignUpStep(signUpStep + 1);
            }
        } catch (error) {
            console.log(error);
            setFooterDisabled(true);
            dispatch(openToaster("Error", "Something went wrong!"));
        }
    }

    const applyFinalRegisteration = async () => {
        setShowLoader(true);

        const data = {
            name: bodyData.createAccount.name,
            email: bodyData.createAccount.email,
            username: bodyData.createAccount.username,
            password: bodyData.createAccount.password,
        };

        try {
            const response = await API(Constants.POST, Constants.REGISTER, data);
            setShowLoader(false);
            closeRegisterDialog();

            const type = response?.data?.meta?.status ? "Success" : "Error";
            const message = type === "Success" ? response?.data?.meta?.message : response?.data?.error?.message ?? "Error";
            dispatch(openToaster(type, message));
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

    function showUserInputPage() {
        setBodyJSX(<UsernameInput handleValidityChange={data => setIsGoogleAuthedUsernameValid(data)} />);
        setFooterText("Set Username");
        setIncludeFooter(true);
        setDisplayOverFlow(false);
    }

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            footerText={footerText}
            includeFooter={includeFooter}
            footerDisabled={footerDisabled}
            footerAction={openNextSignUpStep}
            showLoader={showLoader}
            displayOverflow={displayOverflow}
        />
    )
}

export default Register;
