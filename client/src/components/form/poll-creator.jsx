import "src/styles/form/poll-creator.css";

import React, { useEffect, useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";

import CustomSelect from "../utilities/custom-select";
import LabelledInput from "../utilities/labelled-input";
import DateOptionServices from "src/custom-hooks/date-services";

const PollCreator = ({ closePollCreator, handleChoiceChange, editPollData }) => {
    const containerRef = useRef(null);
    const dateService = new DateOptionServices();
    const dayOfWeekOptions = dateService.getDayOfWeekOptions();
    const hourOptions = dateService.getHourOptions();
    const minuteOptions = dateService.getMinuteOptions();
    const minMinuteOptions = minuteOptions.slice(5, minuteOptions.length);

    const [choices, setChoices] = useState(['', '']);
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [displayedMinuteOptions, setDisplayedMinuteOptions] = useState(minuteOptions);

    useEffect(() => {
        const durationData = { days: dayOfWeek, hours, minutes };
        handleChoiceChange(choices, durationData);
        //eslint-disable-next-line
    }, [choices, dayOfWeek, hours, minutes]);

    useEffect(() => {
        if (editPollData) {
            const { choices, duration } = editPollData;
            if (choices?.length) setChoices([ ...choices ]);
            if (duration) {
                const { days, hours, minutes } = duration;
                setDayOfWeek(days >= 0 ? days : 1);
                setHours(hours >= 0 ? hours : 0);
                setMinutes(minutes >= 0 ? minutes : 0);
            }
        }
    }, [editPollData]);

    const handleChoiceInput = (data, choiceIndex) => {
        let _choices = choices;
        data = data.slice(0, 25);
        _choices[choiceIndex] = data;
        setChoices([..._choices]);
    }

    const addChoice = e => {
        e.stopPropagation();
        e.preventDefault();

        let _choices = choices;
        if (choices.length <= 3) _choices.push('');
        setChoices([..._choices]);
    }

    const handleDurationChanges = (key, value) => {
        switch (key) {
            case "dayOfWeek":
                if (+value === 0) setHours(1);
                setDayOfWeek(value);
                break;
            case "hour":
                let _minuteOptions = [];
                if (+value === 0) {
                    _minuteOptions = minMinuteOptions;
                    setMinutes(5);
                } else {
                    _minuteOptions = minuteOptions;
                }

                setHours(value);
                setDisplayedMinuteOptions(_minuteOptions);
                break;
            case "minute":
                setMinutes(value);
                break;
            default:
                break;
        }
    }

    return (
        <div id="poll-creator-box" ref={containerRef}>
            <div id="poll-choices-box">
                {
                    choices.map((choice, choiceIndex) => {
                        const n = choices.length;

                        return (
                            <React.Fragment key={choiceIndex}>
                                <div className="d-flex position-relative">
                                    <span id="poll-creator-text-limit">{`${choice.length} / 25`}</span>

                                    <LabelledInput
                                        value={choice}
                                        extraClasses={"choice-input-box"}
                                        handleChange={data => handleChoiceInput(data, choiceIndex)}
                                        header={`Choice ${choiceIndex + 1} ${choiceIndex > 1 ? " (optional)" : ''}`}
                                    />

                                    {
                                        choiceIndex === n - 1 && choiceIndex < 3 && (
                                            <div className="add-choice-icon" onClick={e => addChoice(e)}>
                                                <CIcon icon={cilPlus} size="sm" />
                                            </div>
                                        )
                                    }
                                </div>
                            </React.Fragment>
                        )
                    })
                }
            </div>

            <div id="poll-length-box">
                <h6><b>Poll Length</b></h6>

                <div className="row w-100 ml-0">
                    <div className="col-md-4">
                        <CustomSelect
                            label={"Day"}
                            selectedValue={dayOfWeek}
                            options={dayOfWeekOptions}
                            handleValueChange={dayOfWeekValue => { handleDurationChanges("dayOfWeek", dayOfWeekValue); }}
                        />
                    </div>

                    <div className="col-md-4">
                        <CustomSelect
                            label={"Hours"}
                            selectedValue={hours}
                            options={hourOptions}
                            handleValueChange={hourValue => { handleDurationChanges("hour", hourValue); }}
                        />
                    </div>

                    <div className="col-md-4">
                        <CustomSelect
                            label={"Minutes"}
                            selectedValue={minutes}
                            options={displayedMinuteOptions}
                            handleValueChange={minuteValue => { handleDurationChanges("minute", minuteValue); }}
                        />
                    </div>
                </div>
            </div>

            <div id="poll-action-box">
                <div className="poll-box-item" id="remove-poll-item" onClick={closePollCreator}>Remove Poll</div>
            </div>
        </div>
    )
}

export default PollCreator;
