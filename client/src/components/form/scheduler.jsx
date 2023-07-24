import "src/styles/form/scheduler.css";

import CIcon from "@coreui/icons-react";
import { cilCalendar } from "@coreui/icons";
import React, { useRef, useEffect, useState, useLayoutEffect } from "react";

import CustomSelect from "../utilities/custom-select";
import * as Helpers from "src/helpers";

const date = new Date();
const presentYear = date.getFullYear(), monthIndex = date.getMonth();
const dayOfMonthOptions = Helpers.getDayOfMonthOptions(monthIndex, presentYear);

const Scheduler = ({
    scheduleData,
    clearSchedule,
    closeScheduler,
    isPostScheduled,
    confirmSchedule,
    handleClickOutside,
    openScheduledPostList,
}) => {
    const containerRef = useRef(null), defaultDate = new Date();

    const hourOptions = Helpers.getHourOptions();
    const minuteOptions = Helpers.getMinuteOptions();
    const monthOptions = Helpers.getMonthOptions();
    const weekOptions = Helpers.getWeekOptions();
    const yearOptions = [
        { value: presentYear, label: presentYear },
        { value: presentYear + 1, label: presentYear + 1 }
    ];

    defaultDate.setDate(defaultDate.getDate() + 5);

    const [footerTextColor, setFooterTextColor] = useState("#1DA1F2");
    const [dayOfMonth, setDayOfMonth] = useState(defaultDate.getDate());
    const [month, setMonth] = useState(defaultDate.getMonth());
    const [displayedMonth, setDisplayedMonth] = useState(monthOptions[month].label);
    const [displayedDayOfWeek, setDisplayedDayOfWeek] = useState(weekOptions[defaultDate.getDay()]);
    const [year, setYear] = useState(presentYear);
    const [hours, setHours] = useState(defaultDate.getHours());
    const [minutes, setMinutes] = useState(defaultDate.getMinutes());
    const [isDateValid, setIsDateValid] = useState(true);

    useLayoutEffect(() => {
        const containerRect = containerRef?.current?.getBoundingClientRect() ?? null;
        if (containerRect) {
            const isContainerInViewport = Helpers.checkContainerInViewport(containerRect);
            if (!isContainerInViewport) containerRef.current.style.bottom = "87px";
        }
        // eslint-disable-next-line
    }, []);

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

    useEffect(() => {
        if (isPostScheduled && scheduleData) {
            setYear(scheduleData.year);
            setMonth(scheduleData.month);
            setDayOfMonth(scheduleData.dayOfMonth);
            setHours(scheduleData.hours);
            setMinutes(scheduleData.minutes);
        }
        //eslint-disable-next-line
    }, [scheduleData]);

    const handleDateChange = (key, value) => {
        let _year = year, _month = month, _dayOfMonth = dayOfMonth, _minutes = minutes, _hours = hours;

        switch (key) {
            case "dayOfMonth":
                _dayOfMonth = value;
                setDayOfMonth(value);
                break;
            case "month":
                _month = value;
                setMonth(value);
                break;
            case "year":
                _year = value;
                setYear(value);
                break;
            case "hour":
                _hours = value;
                setHours(value);
                break;
            case "minute":
                _minutes = value;
                setMinutes(value);
                break;
            default:
                break;
        }

        const date = new Date(_year, _month, _dayOfMonth, _hours, _minutes, 0, 0);
        setDisplayedMonth(monthOptions[_month].label);
        setDisplayedDayOfWeek(weekOptions[date.getDay()]);
        validateDate(date);
    }

    const validateDate = date => {
        const currentDate = new Date();
        let _isDateValid = false;

        if (date.getFullYear() > currentDate.getFullYear()) {
            _isDateValid = true;
        } else if (date.getFullYear() === currentDate.getFullYear()) {
            if (date.getMonth() > currentDate.getMonth()) {
                _isDateValid = true;
            } else if (date.getMonth() === currentDate.getMonth()) {
                if (date.getDate() > currentDate.getDate()) {
                    _isDateValid = true;
                } else if (date.getDate() === currentDate.getDate()) {
                    if (date.getHours() > currentDate.getHours()) {
                        _isDateValid = true;
                    } else if (date.getHours() === currentDate.getHours()) {
                        _isDateValid = date.getMinutes() > currentDate.getMinutes();
                    }
                }
            }
        }

        setIsDateValid(_isDateValid);
    }

    const confirmAction = e => {
        e.preventDefault();
        e.stopPropagation();
        if (isDateValid) confirmSchedule({ year, month, dayOfMonth, hours, minutes });
    }

    return (
        <div id="scheduler-box" ref={containerRef}>
            <div id="scheduler-body">
                <div className="row pl-2">
                    <div className="col-md-1" onClick={closeScheduler} id="scheduler-header-close">&times;</div>

                    <div className="col-md-5"><h4 className="mt-1"><b>Schedule</b></h4></div>

                    {
                        isPostScheduled && (
                            <div className="col-md-2" id="scheduler-clear-text">
                                <span className="text-decoration-underline" onClick={clearSchedule}><b>Clear</b></span>
                            </div>
                        )
                    }

                    <div
                        onClick={e => confirmAction(e)}
                        style={{ opacity: isDateValid ? 1 : 0.5 }}
                        className={`pr-0 ${isPostScheduled ? "col-md-3" : "col-md-5"}`}
                    >
                        <div className="common-custom-btn float-right mt-1" style={{ cursor: isDateValid ? "pointer" : "not-allowed" }}>
                            Confirm
                        </div>
                    </div>
                </div>

                <div className="pl-2 mt-2">
                    <CIcon icon={cilCalendar} size="custom" width={20} height={20} />

                    <span className="ml-2">
                        {
                            `Will send on ${displayedDayOfWeek}, ${displayedMonth} ${dayOfMonth}, ${year} at
                            ${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`} hours`
                        }
                    </span>
                </div>

                <div className="mt-2 pl-2">
                    <label>Date</label>

                    <div className="row">
                        <div className="col-md-4">
                            <CustomSelect
                                label={"Day"}
                                selectedValue={dayOfMonth}
                                options={dayOfMonthOptions}
                                innerClass={!isDateValid ? "scheduler-error-select" : ''}
                                labelClass={!isDateValid ? "scheduler-error-select-label" : ''}
                                handleValueChange={dayOfMonthValue => handleDateChange("dayOfMonth", dayOfMonthValue)}
                            />
                        </div>

                        <div className="col-md-4">
                            <CustomSelect
                                label={"Month"}
                                selectedValue={month}
                                options={monthOptions}
                                innerClass={!isDateValid ? "scheduler-error-select" : ''}
                                labelClass={!isDateValid ? "scheduler-error-select-label" : ''}
                                handleValueChange={monthValue => handleDateChange("month", monthValue)}
                            />
                        </div>

                        <div className="col-md-4">
                            <CustomSelect
                                label={"Year"}
                                selectedValue={year}
                                options={yearOptions}
                                innerClass={!isDateValid ? "scheduler-error-select" : ''}
                                labelClass={!isDateValid ? "scheduler-error-select-label" : ''}
                                handleValueChange={yearValue => handleDateChange("year", yearValue)}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-2 pl-2">
                    <label>Time</label>

                    <div className="row">
                        <div className="col-md-3">
                            <CustomSelect
                                label={"Hour"}
                                options={hourOptions}
                                selectedValue={hours}
                                innerClass={!isDateValid ? "scheduler-error-select" : ''}
                                labelClass={!isDateValid ? "scheduler-error-select-label" : ''}
                                handleValueChange={hourValue => handleDateChange("hour", hourValue)}
                            />
                        </div>

                        <div className="col-md-3">
                            <CustomSelect
                                label={"Minute"}
                                options={minuteOptions}
                                selectedValue={minutes}
                                innerClass={!isDateValid ? "scheduler-error-select" : ''}
                                labelClass={!isDateValid ? "scheduler-error-select-label" : ''}
                                handleValueChange={minuteValue => handleDateChange("minute", minuteValue)}
                            />
                        </div>
                    </div>

                    {!isDateValid && (<p className="text-danger">{"You can't schedule a post to send it to past."}</p>)}
                </div>

                <div className="mt-4 pl-2">
                    <p>
                        <span id="scheduler-timezone-text">Time Zone</span> <br />
                        <span id="scheduler-timezone-value-text">Indian Standard Time</span>
                    </p>
                </div>
            </div>

            <div
                id="scheduler-footer"
                className="pt-2 pb-2 pl-3"
                onClick={openScheduledPostList}
                onMouseOver={() => setFooterTextColor("white")}
                onMouseLeave={() => setFooterTextColor("#1DA1F2")}
            >
                <span style={{ color: footerTextColor }} id="scheduler-footer-text">Scheduled Events</span>
            </div>
        </div>
    )
}

export default Scheduler;
