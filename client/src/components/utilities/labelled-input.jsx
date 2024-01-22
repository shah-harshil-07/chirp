import "src/styles/utilities/labelled-input.css";

import React, { useEffect, useRef, useState } from "react";

const LabelledInput = ({
    name,
    type,
    value,
    header,
    disabled,
    tabIndex,
    suggestions,
    handleChange,
    extraClasses,
    autoCompleteMode,
    handleOptionSelect,
}) => {
    const unfocusedLabelStyles = { fontSize: "20px", top: "12px", zIndex: '2', left: "21px" };
    const focusedLabelStyles = { animation: "toggleLabel 0.25s linear" };
    const inputRef = useRef(null);

    const [labelStyles, setLabelStyles] = useState(unfocusedLabelStyles);

    useEffect(() => {
        if (value && inputRef.current) inputRef.current.click();
    }, [value]);

    return (
        <div className={`labelled-input-div ${extraClasses ?? ''}`} onClick={() => { inputRef.current.focus(); }}>
            <label style={labelStyles} className="labelled-input-text"> {header} </label>

            <div id="labelled-input-inner-div">
                <input
                    ref={inputRef}
                    name={name ?? ''}
                    disabled={disabled}
                    value={value ?? ''}
                    type={type ?? "text"}
                    tabIndex={tabIndex ?? 0}
                    className="labelled-input-box"
                    autoComplete={autoCompleteMode ? "off" : "on"}
                    onFocus={() => setLabelStyles(focusedLabelStyles)}
                    onChange={e => { if (!disabled) handleChange(e.target.value) }}
                    onBlur={() => { if (!value) setLabelStyles(unfocusedLabelStyles) }}
                />
            </div>

            {
                autoCompleteMode && suggestions?.length > 0 && (
                    <div className="labelled-input-suggestion-container">
                        <div className="labelled-input-ul-container">
                            <ul className="labelled-input-select" role="listbox">
                                {
                                    suggestions.map(({ id, text, selectionObj }, i) => (
                                        <li
                                            key={id}
                                            tabIndex={i}
                                            className="labelled-input-option"
                                            onClick={handleOptionSelect(selectionObj)}
                                        >
                                            {text ?? ''}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default LabelledInput;
