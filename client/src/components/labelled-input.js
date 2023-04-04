import "src/styles/labelled-input.css";

import React, { useState } from "react";

const LabelledInput = ({ value, handleChange, header, disabled }) => {
    const unfocusedLabelStyles = { fontSize: "20px", top: "12px", zIndex: '2', left: "21px" };
    const focusedLabelStyles = { animation: "toggleLabel 0.5s linear" };

    const [labelStyles, setLabelStyles] = useState(unfocusedLabelStyles);

    return (
        <div className="labelled-input-div">
            <label style={labelStyles} className="labelled-input-text"> {header} </label>

            <div id="labelled-input-inner-div">
                <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    className="labelled-input-box"
                    onFocus={() => setLabelStyles(focusedLabelStyles)}
                    onChange={e => { if (!disabled) handleChange(e.target.value) }}
                    onBlur={() => { if (!value) setLabelStyles(unfocusedLabelStyles) }}
                />
            </div>
        </div>
    )
}

export default LabelledInput;
