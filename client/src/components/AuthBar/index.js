import "./index.css";

import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { openModal } from "src/actions/modal";

const AuthBar = () => {
    const dispatch = useDispatch();

    const openRegisterDialog = () => {
        dispatch(openModal());
    }

    return (
        <div id="auth-bar" className="row">
            <div style={{ marginLeft: "32%" }}>
                <div id="top-text">Don't miss what's happening</div><br />
                <div id="bottom-text">People on Chirp are first to know</div>
            </div>

            <div id="auth-box">
                <div className="auth-btn" id="signup-btn" onClick={openRegisterDialog}>
                    <span className="btn-text">Sign up</span>
                </div>

                <div className="auth-btn" id="login-btn" onClick={openRegisterDialog}>
                    <span className="btn-text">Log in</span>
                </div>
            </div>
        </div>
    )
}

export default AuthBar;
