import "./index.css";

import React from "react";

const CustomModal = ({ bodyJSX }) => {
    const logo = require("../../assets/logo-1.png");

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

                        <div className="col-sm-1 custom-close-div">
                            <span className="custom-close-btn">&times;</span>
                        </div>
                    </div>
                </header>

                <div className="custom-container-body">
                    { bodyJSX }
                </div>

                {/* <footer className="custom-modal-footer">
                    <div className="row custom-button-container">
                        <button className="btn btn-primary col-sm-4 custom-custom-btn">Cancel</button>
                        <div className="col-sm-1" />
                        <button className="btn btn-primary col-sm-4 custom-custom-btn">Delete</button>
                    </div>
                </footer> */}
            </div>
        </div>
    )
}

export default CustomModal;

