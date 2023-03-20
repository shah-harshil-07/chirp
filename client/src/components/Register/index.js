import "./index.css";
import React from "react";

const Register = () => {
    return (
        <div className="custom-modal">
            <div className="custom-modal-content">
                <header className="custom-container">
                    <div className="row custom-header-box">
                        <div className="col-sm-11"><h3>Delete User</h3></div>

                        <div className="col-sm-1 custom-close-div">
                            <span className="custom-close-btn">&times;</span>
                        </div>
                    </div>
                </header>

                <div className="custom-container-body">
                    <p>Are you Sure you want to delete?</p>
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

