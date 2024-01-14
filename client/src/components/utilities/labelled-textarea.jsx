import "src/styles/utilities/labelled-textarea.css";

import React, { useEffect, useRef, useState } from "react";

const LabelledInputTextarea = ({ name, header, bodyClasses, rows, value, handleChange }) => {
    const inputRef = useRef(null);

    const focusedStyles = { animation: "toggleTextareaLabel 0.25s linear" };
    const unfocusedStyles = { marginLeft: "9px", marginTop: "12px", fontSize: "20px" };

    const [labelStyles, setLabelStyles] = useState(unfocusedStyles);

    useEffect(() => {
        if (value && inputRef.current) inputRef.current.click();
    }, [value]);

    return (
        <div className={`labelled-textarea-div ${bodyClasses ?? ''}`} onClick={() => { inputRef.current.focus(); }}>
            <label htmlFor={(name ?? '').toLowerCase()} className="labelled-textarea-label" style={labelStyles}>
                {header ?? ''}
            </label>

            <textarea
                ref={inputRef}
                rows={rows ?? 3}
                name={name ?? ''}
                value={value ?? ''}
                className="labelled-textarea-style"
                onChange={e => { handleChange(e.target.value); }}
                onFocus={() => { setLabelStyles(focusedStyles); }}
                onBlur={() => { if (!value) setLabelStyles(unfocusedStyles); }}
            />
        </div>
    );
};

export default LabelledInputTextarea;
