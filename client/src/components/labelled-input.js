import "src/styles/labelled-input.css";

import React, { useRef, useState } from "react";

const LabelledInput = ({ value, handleChange, header, disabled, extraClasses, type }) => {
    const unfocusedLabelStyles = { fontSize: "20px", top: "12px", zIndex: '2', left: "21px" };
    const focusedLabelStyles = { animation: "toggleLabel 0.25s linear" };
    const inputRef = useRef(null);

    const [labelStyles, setLabelStyles] = useState(unfocusedLabelStyles);

    return (
        <div className={`labelled-input-div ${extraClasses}`} onClick={() => { inputRef.current.focus(); }}>
            <label style={labelStyles} className="labelled-input-text"> {header} </label>

            <div id="labelled-input-inner-div">
                <input
                    value={value}
                    ref={inputRef}
                    disabled={disabled}
                    type={type ?? "text"}
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
