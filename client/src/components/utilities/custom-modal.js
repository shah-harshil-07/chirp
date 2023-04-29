import "src/styles/utilities/custom-modal.css";

import React from "react";
import { closeModal } from "src/redux/actions/modal";
import { useDispatch } from "react-redux";
import Loader from "./loader";

const CustomModal = ({ bodyJSX, includeFooter, footerAction, footerText, footerDisabled, showLoader, displayOverflow }) => {
    const logo = require("src/assets/logo-1.png");
    const dispatch = useDispatch();
    const overflowStyles = { overflow: "scroll", overflowX: "hidden", height: "325px" };

    const closeCustomDialog = () => {
        dispatch(closeModal());
    }

    return (
        <div className="custom-modal">
            <div className="custom-modal-content">
                <header className="custom-header">
                    <div className="row custom-header-box">
                        <div className="col-sm-11">
                            <div style={{ marginLeft: "51%" }}>
                                <img alt="logo" width="40px" height="40px" src={String(logo)} />
                            </div>
                        </div>

                        <div className="col-sm-1 custom-close-div" onClick={closeCustomDialog}>
                            <span className="custom-close-btn">&times;</span>
                        </div>
                    </div>
                </header>

                <div className="custom-container-body" style={ displayOverflow ? overflowStyles : {} }>
                    { showLoader ? (<div id="custom-modal-loader-container"><Loader /></div>) : bodyJSX }
                </div>

                {
                    includeFooter && (
                        <div
                            onClick={() => {if (!footerDisabled) footerAction();}}
                            id="custom-modal-footer-box"
                            style={{ opacity: footerDisabled ? 0.5 : 1 }}
                        >
                            <b>{footerText}</b>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default CustomModal;

