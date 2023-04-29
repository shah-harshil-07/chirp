import "src/styles/form/scheduler.css";

import React, { useRef, useEffect, useState } from "react";
import { cilCalendar } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import CustomSelect from "../utilities/custom-select";
import * as Helpers from "src/helpers";

const Scheduler = ({ handleClickOutside, closeScheduler }) => {
    const containerRef = useRef(null);

    const hourOptions = Helpers.getHourOptions();
    const minuteOptions = Helpers.getMinuteOptions();
    const monthOptions = Helpers.getMonthOptions();

    const date = new Date();
    const year = date.getFullYear(), monthIndex = date.getMonth();
    const dayOfMonthOptions = Helpers.getDayOfMonthOptions(monthIndex, year);
    const yearOptions = [
        { value: year, label: year },
        { value: year + 1, label: year + 1},
    ];

    const [footerTextColor, setFooterTextColor] = useState("#1DA1F2");

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

    return (
        <div id="scheduler-box" ref={containerRef}>
            <div id="scheduler-body">
                <div className="row pl-2 pr-2">
                    <div className="col-md-1" onClick={closeScheduler} id="scheduler-header-close">&times;</div>
                    <div className="col-md-6"><h4 className="mt-1"><b>Schedule</b></h4></div>
                    <div className="col-md-4 pr-0" onClick={closeScheduler}>
                        <div className="common-custom-btn float-right mt-1">Confirm</div>
                    </div>
                </div>

                <div className="pl-2 mt-2">
                    <CIcon icon={cilCalendar} size="custom" width={20} height={20} />
                    <span className="ml-2">Will send on May 3, 2023 at 4:13PM</span>
                </div>

                <div className="mt-2 pl-2">
                    <label>Date</label>
                    <div className="row">
                        <div className="col-md-4"><CustomSelect label={"Day"} options={dayOfMonthOptions} /></div>
                        <div className="col-md-4"><CustomSelect label={"Month"} options={monthOptions} /></div>
                        <div className="col-md-4"><CustomSelect label={"Year"} options={yearOptions} /></div>
                    </div>
                </div>

                <div className="mt-2 pl-2">
                    <label>Time</label>
                    <div className="row">
                        <div className="col-md-3"><CustomSelect label={"Hour"} options={hourOptions} /></div>
                        <div className="col-md-3"><CustomSelect label={"Minute"} options={minuteOptions} /></div>
                    </div>
                </div>

                <div className="mt-4 pl-2">
                    <p>
                        <span id="scheduler-timezone-text">Time Zone</span> <br />
                        <span id="scheduler-timezone-value-text">Indian Standard Time</span>
                    </p>
                </div>
            </div>

            <div
                className="pt-2 pb-2 pl-3"
                onMouseOver={() => setFooterTextColor("white")}
                onMouseLeave={() => setFooterTextColor("#1DA1F2")}
                id="scheduler-footer"
            >
                <span style={{ color: footerTextColor }} id="scheduler-footer-text">Scheduled Events</span>
            </div>
        </div>
    )
}

export default Scheduler;
