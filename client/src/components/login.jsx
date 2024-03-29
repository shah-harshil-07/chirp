import "src/styles/auth.css";
import "src/styles/login.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { cibGoogle, cilLockLocked, cilLockUnlocked } from "@coreui/icons";

import API from "src/api";
import CustomModal from "./utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import LabelledInput from "./utilities/labelled-input";
import { openToaster } from "src/redux/reducers/toaster";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { openModal, closeModal } from "src/redux/reducers/modal";

const Login = () => {
    const { getImageFetchingPromise } = usePostServices();
    const navigate = useNavigate(), { showError } = useToaster();

    const [cred, setCred] = useState('');
    const [password, setPassword] = useState('');
    const [passwordLocked, setPasswordLocked] = useState(true);
    const [googleRegisteredUser, setGoogleRegisteredUser] = useState(null);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: response => { setGoogleRegisteredUser(response); },
        onError: err => { console.log(err); },
    });

    useEffect(() => {
        (async function attemptGoogleLogin() {
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
                        const picture = response?.data?.picture ?? '';

                        checkGoogleAuthedUser({ name, email, googleId, picture });
                    }
                } catch (error) {
                    showError("Something went wrong!");
                    setGoogleRegisteredUser(null);
                }
            }
        })();
        // eslint-disable-next-line
    }, [googleRegisteredUser]);

    const loginBodyJSX = (
        <>
            <h4 className="header">Sign in to Chirp</h4>

            <div className="auth-box" onClick={loginWithGoogle}>
                <span className="d-flex justify-content-center align-items-center">
                    <CIcon icon={cibGoogle} id="google-signup-icon" />
                    <span id="google-signup-text">Sign in with google</span>
                </span>
            </div>

            <div className="or-box">
                <hr style={{ backgroundColor: "#bbc2c9" }} />
                <div className="or-div">or</div>
            </div>

            <LabelledInput tabIndex={1} value={cred} handleChange={data => { setCred(data); }} header={"Email or Username"} />

            <div className="position-relative">
                <LabelledInput
                    tabIndex={2}
                    value={password}
                    header={"Password"}
                    extraClasses={"mt-3"}
                    type={passwordLocked ? "password" : "text"}
                    handleChange={data => { setPassword(data) }}
                />

                <CIcon
                    size="sm"
                    className="pwd-eye"
                    onClick={() => { setPasswordLocked(!passwordLocked) }}
                    icon={passwordLocked ? cilLockLocked : cilLockUnlocked}
                />
            </div>

            <div
                tabIndex={3}
                id="login-next-box"
                className="auth-box"
                onClick={attemptLogin}
                style={{ backgroundColor: (cred && password) ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)" }}
            >
                <span className="d-flex justify-content-center align-items-end auth-text"> Login </span>
            </div>

            <div className="bottom-text">
                Don't have an account?
                <span className="link-text" onClick={openRegisterDialog}>{` Sign up`}</span>
                <span className="link-text float-right">Forgot Password?</span>
            </div>
        </>
    );

    const dispatch = useDispatch();

    const checkGoogleAuthedUser = async userData => {
        closeLoginDialog();

        try {
            let type = '', message = '';
            const response = await API(Constants.POST, Constants.LOGIN_WITH_GOOGLE_CRED, userData);
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data) {
                type = "Success";
                message = "User logged in successfully.";
                let { token, user: userDetails } = responseData.data;
                userDetails = { ...userDetails, picture: userData.picture };

                if (token && userDetails) {
                    localStorage.setItem("chirp-accessToken", token);
                    localStorage.setItem("chirp-userDetails", JSON.stringify(userDetails));
                }
            } else if (responseData?.meta?.message) {
                type = "Error";
                message = responseData.meta.message;
            }

            dispatch(openToaster({ messageObj: { type, message } }));
            setTimeout(() => { navigate(0); }, 4990);
        } catch (error) {
            console.log(error);
            showError("Something went wrong!");
            closeLoginDialog();
        }
    }

    function openRegisterDialog() {
        dispatch(openModal({ type: "register" }));
    }

    function closeLoginDialog() {
        dispatch(closeModal());
    }

    async function attemptLogin() {
        try {
            const response = await API(Constants.POST, Constants.LOGIN, { cred, password });
            const responseData = response.data;

            if (responseData?.meta?.status && responseData?.data) {
                const token = responseData?.data?.accessToken ?? '';
                const userData = responseData?.data?.userData ?? null;
                const userValid = responseData?.data?.userValid ?? false;

                if (userData?.picture) {
                    await getImageFetchingPromise(userData.picture, base64Image => userData["picture"] = base64Image, "user");
                }

                const type = userValid ? "Success" : "Error";
                const message = responseData?.meta?.message ?? "Something went wrong";

                if (userValid && token && userData) {
                    localStorage.setItem("chirp-userDetails", JSON.stringify(userData));
                    localStorage.setItem("chirp-accessToken", token);

                    closeLoginDialog();
                    setTimeout(() => { navigate(0); }, 4990);
                }

                dispatch(openToaster({ messageObj: { type, message } }));
            } else {
                const errorMessage = responseData?.error?.message ?? "Something went wrong!";
                showError(errorMessage);
            }
        } catch (error) {
            console.log(error);
            showError("Something went wrong!");
        }
    }

    return <CustomModal bodyJSX={loginBodyJSX} includeFooter={false} includeHeader={true} />;
}

export default Login;
