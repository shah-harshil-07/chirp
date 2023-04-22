import "src/styles/utilities/toaster.css";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { closeToaster } from "src/actions/toaster";

const Toaster = ({ type, message }) => {
    const dispatch = useDispatch();
    const bgColor = (type === "Success")
        ? "rgb(12, 237, 19, 0.65)"
        : (type === "Error")
            ? "rgb(235, 14, 51, 0.75)"
            : "rgb(29, 161, 242, 0.75)"
    ;

    useEffect(() => {
        setTimeout(() => {
            closeToasterDialog();
        }, 5000);
        // eslint-disable-next-line
    }, []);

    const closeToasterDialog = () => {
        dispatch(closeToaster());
    }

    return (
        <div id="toaster-container" style={{ backgroundColor: bgColor }}>
            <b>{type}</b>

            <div id="toaster-close-container" onClick={closeToasterDialog}>
                <span id="toaster-close">&times;</span>
            </div>

            <div>{message}</div>
        </div>
    )
}

export default Toaster;
