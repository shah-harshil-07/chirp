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

            <hr />

            <h6><b>Poll Length</b></h6>
            <div className="row w-100 ml-0 mb-3">
                <div style={{ width: "33%", paddingLeft: "5px", paddingRight: "5px" }}>
                    <label>Days</label>
                    <select className="w-100">
                        {
                            dayOptions.map(day => (
                                <option value={day}>{day}</option>
                            ))
                        }
                    </select>
                </div>

                <div style={{ width: "33%", paddingLeft: "5px", paddingRight: "5px" }}>
                    <label>Hours</label>
                    <select className="w-100">
                        {
                            hourOptions.map(hour => (
                                <option value={hour}>{hour}</option>
                            ))
                        }
                    </select>
                </div>

                <div style={{ width: "28%", paddingLeft: "5px", paddingRight: "5px" }}>
                    <label>Minutes</label>
                    <select className="w-100">
                        {
                            minuteOptions.map(minute => (
                                <option value={minute}>{minute}</option>
                            ))
                        }
                    </select>
                </div>
            </div>
        </div>
    )
}

export default PollCreator;
