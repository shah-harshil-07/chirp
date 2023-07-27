import "src/styles/utilities/confirmation.css";

import React from "react";

const Confirmation = ({ message, handleCloseAction, headingText }) => {
    return (
        <div className="confirmation-modal">
            <div className="confirmation-content">
                <div className="confirmation-header">
                    <div className="row">
                        <div className="col-sm-10 confirmation-header-text">
                            <b>{headingText}</b>
                        </div>

                        <div className="col-sm-2 confirmation-close-div float-right" onClick={handleCloseAction}>
                            <div className="confirmation-close-btn-container">
                                <span className="custom-close-btn">&times;</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="confirmation-text-content">
                    <p className="confirmation-message">{message}</p>
                    <p className="confirmation-confirm">Confirm</p>
                    <p className="confirmation-cancel" onClick={handleCloseAction}>Cancel</p>
                </div>
            </div>
        </div>
    )
}

export default Confirmation;
