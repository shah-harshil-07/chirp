import "src/styles/form/poll-creator.css";

import React, { useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";

import LabelledInput from "../utilities/labelled-input";

const PollCreator = () => {
    const dayOptions = [], hourOptions = [], minuteOptions = [];
    for (let i = 0; i < 60; i++) {
        if (i < 8) dayOptions.push(i);
        if (i < 24) hourOptions.push(i);
        minuteOptions.push(i);
    }

    const [choices, setChoices] = useState(['', '']);

    const handleChoiceInput = (data, choiceIndex) => {
        let _choices = choices;
        _choices[choiceIndex] = data;
        setChoices([..._choices]);
    }

    const addChoice = () => {
        let _choices = choices;
        if (choices.length <= 3) _choices.push('');
        setChoices([..._choices]);
    }

    return (
        <div id="poll-creator-box">
            <div style={{ borderBottom: "1px solid rgba(29, 161, 242, 0.6)", paddingLeft: "10px" }}>
                {
                    choices.map((choice, choiceIndex) => {
                        const n = choices.length;

                        return (
                            <div style={{ display: "flex" }} key={choiceIndex}>
                                <LabelledInput
                                    value={choice}
                                    extraClasses={"choice-input-box"}
                                    header={`Choice ${choiceIndex + 1}`}
                                    handleChange={data => handleChoiceInput(data, choiceIndex)}
                                />

                                {
                                    choiceIndex === n - 1 && choiceIndex < 3 && (
                                        <div className="add-choice-icon" onClick={addChoice}>
                                            <CIcon icon={cilPlus} size="sm" />
                                        </div>
                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>

            <div style={{ paddingLeft: "10px", paddingTop: "10px", paddingBottom: "10px", borderBottom: "1px solid rgba(29, 161, 242, 0.6)" }}>
                <h6><b>Poll Length</b></h6>

                <div className="row w-100 ml-0">
                    <div style={{ width: "33%", paddingLeft: "5px", paddingRight: "5px", position: "relative" }}>
                        <label style={{ position: "absolute", left: "10px" }}>Days</label>

                        <select className="w-100" style={{ height: "50px", paddingTop: "20px", paddingLeft: "1px", border: "1px solid rgba(29, 161, 242, 0.6)", backgroundColor: "white", cursor: "pointer" }}>
                            {dayOptions.map(day => (<option value={day}>{day}</option>))}
                        </select>
                    </div>

                    <div style={{ width: "33%", paddingLeft: "5px", paddingRight: "5px", position: "relative" }}>
                        <label style={{ position: "absolute", left: "10px" }}>Hours</label>

                        <select className="w-100" style={{ height: "50px", paddingTop: "20px", paddingLeft: "1px", border: "1px solid rgba(29, 161, 242, 0.6)", backgroundColor: "white", cursor: "pointer" }}>
                            {hourOptions.map(hour => (<option value={hour}>{hour}</option>))}
                        </select>
                    </div>

                    <div style={{ width: "28%", paddingLeft: "5px", paddingRight: "5px", position: "relative" }}>
                        <label style={{ position: "absolute", left: "10px" }}>Minutes</label>

                        <select className="w-100" style={{ height: "50px", paddingTop: "20px", paddingLeft: "1px", border: "1px solid rgba(29, 161, 242, 0.6)", backgroundColor: "white", cursor: "pointer" }}>
                            {minuteOptions.map(minute => (<option value={minute}>{minute}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", height: "50px" }}>
                <div style={{ textAlign: "center", width: "100%", paddingTop: "14px", borderRight: "1px solid rgba(29, 161, 242, 0.6)" }}>Reset Poll</div>
                <div style={{ textAlign: "center", width: "100%", paddingTop: "14px" }}>Remove Poll</div>
            </div>
        </div>
    )
}

export default PollCreator;
