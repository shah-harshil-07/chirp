import "./index.css";
import React from "react";

const Register = () => {
    const logo = require("../../assets/logo-1.png");

    return (
        <div className="custom-modal">
            <div className="custom-modal-content">
                <header className="custom-container">
                    <div className="row custom-header-box">
                        <div className="col-sm-11">
                            <center><img alt="logo" width="40px" height="40px" src={String(logo)} /></center>
                        </div>

                        <div className="col-sm-1 custom-close-div">
                            <span className="custom-close-btn">&times;</span>
                        </div>
                    </div>
                </header>

                <div className="custom-container-body">
                    <div style={{ width: "100%", height: "30px", border: "1px solid black", borderRadius: "20px", paddingLeft: "12px" }}>
                        Sign up with google
                    </div>
                </div>

                <footer className="custom-modal-footer">
                    <div className="row custom-button-container">
                        <button className="btn btn-primary col-sm-4 custom-custom-btn">Cancel</button>
                        <div className="col-sm-1" />
                        <button className="btn btn-primary col-sm-4 custom-custom-btn">Delete</button>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Register;

