import "src/styles/auth.css";

import React, { useEffect, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "../CustomModal";
import CredInput from "./cred-input";
import { openModal } from "src/actions/modal";

const Login = () => {
    const dispatch = useDispatch();

    const openRegisterDialog = () => {
        dispatch(openModal("register"));
    }

    const [page, setPage] = useState(1);
    const [bodyJSX, setBodyJSX] = useState(<></>);

    useEffect(() => {
        let _bodyJSX = page === 1 ? loginBodyJSX : <CredInput />
        setBodyJSX(_bodyJSX);
    }, [page]);

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

            <div className="auth-box" id="next-box" onClick={() => setPage(2)}>
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

    return (
        <CustomModal bodyJSX={bodyJSX} />
    )
}

export default Login;
