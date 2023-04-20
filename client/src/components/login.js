import "src/styles/auth.css";
import "src/styles/login.css";

import React, { useState, useEffect } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";

import CustomModal from "./utilities/custom-modal";
import { openModal, closeModal } from "src/actions/modal";
import LabelledInput from "./utilities/labelled-input";
import * as Constants from "src/constants";
import API from "src/api";
import { openToaster } from "src/actions/toaster";

const Login = () => {
    const [cred, setCred] = useState('');
    const [password, setPassword] = useState('');
    const [googleRegisteredUser, setGoogleRegisteredUser] = useState(null);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: response => { setGoogleRegisteredUser(response) },
        onError: err => { console.log(err) },
    });

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

    const loginBodyJSX = (
        <>
            <h4 className="header">Sign in to Chirp</h4>

            <div className="auth-box" onClick={() => loginWithGoogle()}>
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

            <div
                className="auth-box"
                id="login-next-box"
                onClick={attemptLogin}
                style={{ backgroundColor: (cred && password) ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)" }}
            >
                <span className="d-flex justify-content-center align-items-end auth-text"> Login </span>
            </div>

            <div className="bottom-text">
                Don't have an account?
                <span className="link-text" onClick={openRegisterDialog}>{` Sign up`}</span>
                <span className="link-text" style={{ float: "right" }}>Forgot Password?</span>
            </div>
        </>
    );

    const dispatch = useDispatch();

    const checkGoogleAuthedUser = async userData => {
        closeLoginDialog();

        try {
            let type = '', message = '';
            const response = await API(Constants.POST, Constants.CHECK_GOOGLE_CREDENTIALS, userData);
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data) {
                type = responseData.data.userAvailable ? "Success" : "Error";
                message = "User logged in successfully.";
            } else if (responseData?.error?.message) {
                type = "Error";
                message = responseData.error.message;
            }

            dispatch(openToaster(type, message));
        } catch (error) {
            console.log(error);
            dispatch(openToaster("Error", "Something went wrong!"));
            closeLoginDialog();
        }
    }

    function openRegisterDialog() {
        dispatch(openModal("register"));
    }

    function closeLoginDialog() {
        dispatch(closeModal());
    }

    async function attemptLogin() {
        try {
            const response = await API(Constants.POST, Constants.LOGIN, { cred, password });
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data) {
                const userValid = responseData?.data?.userValid ?? false;
                const token = responseData?.data?.accessToken ?? '';
                const message = responseData?.meta?.message ?? "Something went wrong";
                const type = userValid ? "Success" : "Error";
                if (userValid && token) localStorage.setItem("chirp-accessToken", token);
                dispatch(openToaster(type, message));
                closeLoginDialog();
            } else {
                const errorMessage = responseData?.error?.message ?? "Something went wrong!";
                dispatch(openToaster("Error", errorMessage));
            }
        } catch (error) {
            console.log(error);
            dispatch(openToaster("Error", "Something went wrong!"));
        }

        closeLoginDialog();
    }

    return (
        <CustomModal bodyJSX={loginBodyJSX} includeFooter={false} />
    )
}

export default Login;
