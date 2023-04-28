import "src/styles/utilities/custom-select.css";

import React from "react";

const CustomSelect = ({ label, options }) => {
    return (
        <div className="custom-select-div">
            <label className="custom-select-label">{label}</label>

            <select className="w-100 main-select">
                {options.map(optionObj => (<option key={optionObj.value} value={optionObj.value}>{optionObj.label}</option>))}
            </select>
        </div>
    )
}

export default CustomSelect;
