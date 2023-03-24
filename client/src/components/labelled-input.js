import React from "react";
import "src/styles/labelled-input.css";

const LabelledInput = () => {
    return (
        <div className="labelled-input-div">
            <label className="labelled-input-text">Password</label>
            <div>
                <input type="text" className="labelled-input-box" />
            </div>
        </div>
    )
}

export default LabelledInput;

