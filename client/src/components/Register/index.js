import "src/styles/auth.css";
import "./index.css";

import React from "react";
import CIcon from "@coreui/icons-react";
import { cibGoogle } from "@coreui/icons";
import { useDispatch } from "react-redux";

import CustomModal from "../CustomModal";
import { openModal } from "src/actions/modal";
import CreateAccount from "../CreateAccount";

const Register = () => {
    const dispatch = useDispatch();

    const openLoginDialog = () => {
        dispatch(openModal("login"));
    }

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

            <div className="auth-box" id="create-box"><span>Create Account</span></div>

            <div className="bottom-text">
                Have an account already? 
                <span className="link-text" onClick={openLoginDialog}>{` Log in`}</span>
            </div>
        </>
    )

    return (
        // <CustomModal bodyJSX={registerBodyJSX} />
        <CustomModal bodyJSX={<CreateAccount />} />
    )
}

export default Register;

