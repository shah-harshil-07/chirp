import "src/styles/utilities/custom-select.css";

import React from "react";

const CustomSelect = ({ label, options, selectedValue, handleValueChange, innerClass, labelClass }) => {
    return (
        <div className="custom-select-div">
            <label className={`custom-select-label ${labelClass}`}>{label}</label>

            <select
                value={selectedValue}
                onChange={e => handleValueChange(e.target.value)}
                className={`w-100 main-select inner-class ${innerClass}`}
            >
                {options.map(optionObj => (<option key={optionObj.value} value={optionObj.value}>{optionObj.label}</option>))}
            </select>
        </div>
    )
}

export default CustomSelect;
