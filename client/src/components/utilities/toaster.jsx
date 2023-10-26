import "src/styles/utilities/toaster.css";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { closeToaster } from "src/redux/reducers/toaster";

const Toaster = ({ type, message }) => {
    let icon, bgColor;
    const tickIcon = require("src/assets/tick.png");
    const dangerIcon = require("src/assets/danger.png");

    const dispatch = useDispatch();

    switch (type) {
        case "Success":
            bgColor = "green";
            icon = tickIcon;
            break;
        case "Error":
            bgColor = "red";
            icon = dangerIcon;
            break;
        default:
            break;
    }

    useEffect(() => {
        setTimeout(() => {
            closeToasterDialog();
        }, 4990);

        // eslint-disable-next-line
    }, []);

    const closeToasterDialog = () => {
        dispatch(closeToaster());
    }

    return icon && bgColor ? (
        <div className="toast-container">
            <div className="toast-inner-container">
                <div className="toast-body">
                    <div><img src={icon} width={20} height={20} alt="icon" /></div>
                    <div style={{ width: "100%", textAlign: "center" }}>{message}</div>
                </div>

                <button onClick={closeToasterDialog} className="toast-close-btn">&times;</button>

                <div className="toast-progressbar" style={{ backgroundColor: bgColor }} />
            </div>
        </div>
    ) : (
        <></>
    );
}

export default Toaster;
