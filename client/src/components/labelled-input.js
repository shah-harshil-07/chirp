import React from "react";
import "src/styles/labelled-input.css";

const LabelledInput = ({ value, handleChange, header }) => {
    return (
        <div className="labelled-input-div">
            <label className="labelled-input-text">{header}</label>
            <div>
                <input
                    type="text"
                    value={value}
                    className="labelled-input-box"
                    onChange={e => handleChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export default LabelledInput;
