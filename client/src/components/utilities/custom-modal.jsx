import "src/styles/utilities/custom-modal.css";

import React from "react";
import { useDispatch } from "react-redux";

import Loader from "./loader";
import { closeModal } from "src/redux/reducers/modal";

const CustomModal = ({
    bodyJSX,
    footerText,
    showLoader,
    bodyClasses,
    footerAction,
    includeHeader,
    includeFooter,
    footerDisabled,
    customHeaderJSX,
    displayOverflow,
    customFooterJSX,
    modalContentClasses,
}) => {
    const dispatch = useDispatch();
    const logo = require("src/assets/logo-1.png");
    const overflowStyles = { overflow: "scroll", overflowX: "hidden", height: includeFooter ? "325px" : "80%" };

    const closeCustomDialog = () => {
        dispatch(closeModal());
    }

    return (
        <div className="custom-modal">
            <div className={`custom-modal-content ${modalContentClasses ?? ''}`}>
                <header className="custom-header">
                    <div className="row mr-0">
                        {
                            includeHeader ? customHeaderJSX ? customHeaderJSX : (
                                <>
                                    <div className="col-sm-11">
                                        <div style={{ marginLeft: "51%" }}>
                                            <img alt="logo" width="40px" height="40px" src={String(logo)} />
                                        </div>
                                    </div>

                                    <div className="col-sm-1 custom-close-div" onClick={closeCustomDialog}>
                                        <div className="custom-close-btn-container">
                                            <span className="custom-close-btn">&times;</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="col-sm-12 pr-0">
                                    <div className="col-sm-1 custom-close-div float-right" onClick={closeCustomDialog}>
                                        <div className="custom-close-btn-container">
                                            <span className="custom-close-btn">&times;</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </header>

                <div className={`custom-container-body ${bodyClasses ?? ''}`} style={displayOverflow ? overflowStyles : {}}>
                    {showLoader ? (<div id="custom-modal-loader-container"><Loader /></div>) : bodyJSX}
                </div>

                {
                    includeFooter ? customFooterJSX ? customFooterJSX : (
                        <div
                            id="custom-modal-footer-box"
                            style={{ opacity: footerDisabled ? 0.5 : 1 }}
                            onClick={() => { if (!footerDisabled) footerAction(); }}
                        >
                            <b>{footerText}</b>
                        </div>
                    ) : (
                        <></>
                    )
                }
            </div>
        </div>
    )
}

export default CustomModal;

