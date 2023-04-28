import "src/styles/form/poll-creator.css";

import React, { useEffect, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";

import LabelledInput from "../utilities/labelled-input";
import CustomSelect from "../utilities/custom-select";

const PollCreator = ({ handleClickOutside }) => {
    const containerRef = useRef(null);
    const dayOptions = [], hourOptions = [], minuteOptions = [];
    for (let i = 0; i < 60; i++) {
        if (i < 8) dayOptions.push({value: i, label: i});
        if (i < 24) hourOptions.push({value: i, label: i});
        minuteOptions.push({value: i, label: i});
    }

    const [choices, setChoices] = useState(['', '']);

    useEffect(() => {
        const outsideClickFn = e => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                handleClickOutside();
            }
        }

        document.addEventListener("click", outsideClickFn);

        return () => {
            document.removeEventListener("click", outsideClickFn);
        };
    }, [handleClickOutside]);

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
        <div id="poll-creator-box" ref={containerRef}>
            <div id="poll-choices-box">
                {
                    choices.map((choice, choiceIndex) => {
                        const n = choices.length;

                        return (
                            <div className="d-flex" key={choiceIndex}>
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

            <div id="poll-length-box">
                <h6><b>Poll Length</b></h6>

                <div className="row w-100 ml-0">
                    <div className="col-md-4"><CustomSelect label={"Day"} options={dayOptions} /></div>
                    <div className="col-md-4"><CustomSelect label={"Hours"} options={hourOptions} /></div>
                    <div className="col-md-4"><CustomSelect label={"Minutes"} options={minuteOptions} /></div>
                </div>
            </div>

            <div id="poll-action-box">
                <div className="poll-box-item" id="reset-poll-item">Reset Poll</div>
                <div className="poll-box-item" id="remove-poll-item">Remove Poll</div>
            </div>
        </div>
    )
}

export default PollCreator;
