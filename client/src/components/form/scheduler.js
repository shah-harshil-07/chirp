import "src/styles/form/scheduler.css";

import React from "react";
import { cilCalendar } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import CustomSelect from "../utilities/custom-select";

const Scheduler = () => {
    return (
        <div id="scheduler-box">
            <div id="scheduler-body">
                <div className="row pl-2 pr-2">
                    <div className="col-md-1" id="scheduler-header-close">&times;</div>
                    <div className="col-md-6"><h4 className="mt-1"><b>Schedule</b></h4></div>
                    <div className="col-md-4 pr-0">
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
                        <div className="col-md-4"><CustomSelect label={"Day"} options={[]} /></div>
                        <div className="col-md-4"><CustomSelect label={"Month"} options={[]} /></div>
                        <div className="col-md-4"><CustomSelect label={"Year"} options={[]} /></div>
                    </div>
                </div>

                <div className="mt-2 pl-2">
                    <label>Time</label>
                    <div className="row">
                        <div className="col-md-3"><CustomSelect label={"Hour"} options={[]} /></div>
                        <div className="col-md-3"><CustomSelect label={"Minute"} options={[]} /></div>
                    </div>
                </div>

                <div className="mt-4 pl-2">
                    <p>
                        <span id="scheduler-timezone-text">Time Zone</span> <br />
                        <span id="scheduler-timezone-value-text">Indian Standard Time</span>
                    </p>
                </div>
            </div>

            <div className="pt-2 pb-2 pl-3">
                <span id="scheduler-footer-text">Scheduled Events</span>
            </div>
        </div>
    )
}

export default Scheduler;
