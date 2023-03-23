import "./index.css";

import React from "react";
import { closeModal } from "src/actions/modal";
import { useDispatch } from "react-redux";

const CustomModal = ({ bodyJSX }) => {
    const logo = require("../../assets/logo-1.png");
    const dispatch = useDispatch();

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

                <div className="custom-container-body">
                    { bodyJSX }
                </div>
            </div>
        </div>
    )
}

export default CustomModal;

