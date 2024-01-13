import "src/styles/user/info.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import React, { useEffect, useState } from "react";
import { cilCalendar, cilBirthdayCake, cilLink, cilLocationPin } from "@coreui/icons";

import CustomModal from "../utilities/custom-modal";
import CustomSelect from "../utilities/custom-select";
import LabelledInput from "../utilities/labelled-input";
import { placeHolderImageSrc } from "src/utilities/constants";
import DateOptionServices from "src/custom-hooks/date-services";

const UserInfo = ({ details }) => {
    const totalLineLength = 1040;
    let availableCoverage = totalLineLength;
    const sampleUserImg = require("src/assets/sample-user.png");

    const dateService = new DateOptionServices();
    const yearOptions = dateService.getYearOptions();
    const monthOptions = dateService.getMonthOptions();

    const currentDate = new Date();
    const preselectedDay = currentDate.getUTCDate();
    const preselectedMonth = currentDate.getUTCMonth();
    const preselectedYear = currentDate.getFullYear() - 5;
    const initialDayOfMonthOptions = dateService.getDayOfMonthOptions(preselectedMonth, preselectedYear);
    const _profileDetails = {
        bio: '',
        name: '',
        website: '',
        location: '',
        dateOfBirth: {
            day: preselectedDay,
            year: preselectedYear,
            month: preselectedMonth,
        },
    };

    const _statsList = [
        { icon: cilLink, serverKey: "website", text: '' },
        { icon: cilCalendar, serverKey: "createdAt", text: '' },
        { icon: cilLocationPin, serverKey: "location", text: '' },
        { icon: cilBirthdayCake, serverKey: "dateOfBirth", text: '' },
    ];

    const [userData, setUserData] = useState({});
    const [websiteLink, setWebsiteLink] = useState('#');
    const [statsList, setStatsList] = useState([..._statsList]);
    const [errors, setErrors] = useState({ ..._profileDetails });
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [profileDetails, setProfileDetails] = useState({ ..._profileDetails });
    const [dayOfMonthOptions, setDayOfMonthOptions] = useState([...initialDayOfMonthOptions]);

    useEffect(() => {
        if (details) {
            setUserData({ ...details });
            updateStats();
        }

        // eslint-disable-next-line
    }, [details]);

    useEffect(() => {
        const { year, month } = profileDetails?.dateOfBirth ?? {};
        const _dayOfMonthOptions = dateService.getDayOfMonthOptions(month, year);
        const dateOfBirth = { ...profileDetails.dateOfBirth, day: 1 };
        setProfileDetails({ ...profileDetails, dateOfBirth });
        setDayOfMonthOptions([..._dayOfMonthOptions]);
    }, [profileDetails.dateOfBirth.month]);

    const formatDisplayedDate = date => {
        return moment(date).format("MMM Do, YYYY");
    }

    const updateStats = () => {
        const updatedStatsList = [];

        _statsList.forEach(statsObj => {
            const { icon, serverKey } = statsObj;
            let value = details[serverKey];

            if (value) {
                switch (serverKey) {
                    case "dateOfBirth":
                        value = `Born ${formatDisplayedDate(value)}`;
                        break;
                    case "createdAt":
                        value = `Joined on ${formatDisplayedDate(value)}`;
                        break;
                    case "website":
                        setWebsiteLink(value);
                        value = value.replaceAll(/https:\/\/|www./g, '');
                        if (value.length > 30) value = `${value.slice(0, 28)}...`;
                        break;
                    default:
                        break;
                }

                updatedStatsList.push({ icon, serverKey, text: value });
            }
        });

        setStatsList([...updatedStatsList]);
    }

    const openProfileEditor = () => {
        setShowProfileEditor(true);
    }

    const closeProfileEditor = () => {
        setShowProfileEditor(false);
    }

    const handleInputChange = (key, value) => {
        setErrors({ ...errors, [key]: '' });
        setProfileDetails({ ...profileDetails, [key]: value });
    }

    const editProfileHeaderJSX = (
        <div className="w-100 row">
            <div className="col-sm-1 custom-close-div" onClick={closeProfileEditor}>
                <div className="custom-close-btn-container">
                    <span className="custom-close-btn">&times;</span>
                </div>
            </div>

            <div className="col-sm-11" style={{ paddingLeft: "25px", paddingTop: "2px" }}>
                <b style={{ fontSize: "25px" }}>Edit profile</b>

                <div id="user-info-follow-btn" style={{ marginTop: "2px", fontWeight: "bold" }}>Save</div>
            </div>
        </div>
    );

    const editProfileBodyJSX = (
        <div className="w-100">
            <img alt="background" id="user-info-back-img" src={placeHolderImageSrc} />

            <div id="user-info-user-img-container">
                <img
                    alt={"user"}
                    id="user-info-user-img"
                    src={userData?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />
            </div>

            <div style={{ padding: "20px" }}>
                <LabelledInput
                    header={"Name"}
                    value={profileDetails["name"]}
                    handleChange={value => { handleInputChange("name", value); }}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <div className="mt-3" style={{ display: "flex", flexDirection: "column", border: "1px solid var(--chirp-color)", paddingLeft: "12px", paddingRight: "12px", borderRadius: "12px" }}>
                    <label htmlFor="bio" style={{ marginLeft: "2px", fontSize: "14px", fontWeight: "bold", color: "var(--chirp-color)", marginBottom: '0' }}>Bio</label>
                    <textarea rows={3} style={{ height: "80%", width: "100%", border: "none", outline: "none" }} value={profileDetails.bio} />
                </div>

                <LabelledInput
                    header={"Location"}
                    extraClasses={"mt-3"}
                    value={profileDetails["location"]}
                    handleChange={value => { handleInputChange("location", value); }}
                />

                <LabelledInput
                    header={"Website"}
                    extraClasses={"mt-3"}
                    value={profileDetails["website"]}
                    handleChange={value => { handleInputChange("website", value); }}
                />

                <div className="d-flex mt-3 w-100" style={{ paddingLeft: "12px", paddingRight: "12px", justifyContent: "space-between" }}>
                    <div style={{ width: "120px", display: "flex", flexWrap: "wrap", alignContent: "center", fontWeight: "bold", color: "var(--chirp-color)", fontSize: "18px" }}>Date of Birth</div>

                    <CustomSelect
                        label={"Day"}
                        options={dayOfMonthOptions}
                        divClass={"user-info-day-select"}
                        selectedValue={profileDetails.dateOfBirth.day}
                        handleValueChange={value => { handleInputChange("dateOfBirth.day", value); }}
                    />

                    <CustomSelect
                        label={"Month"}
                        options={monthOptions}
                        divClass={"user-info-month-select"}
                        selectedValue={profileDetails.dateOfBirth.month}
                        handleValueChange={value => { handleInputChange("dateOfBirth.month", value); }}
                    />

                    <CustomSelect
                        label={"Year"}
                        options={yearOptions}
                        divClass={"user-info-year-select"}
                        selectedValue={profileDetails.dateOfBirth.year}
                        handleValueChange={value => { handleInputChange("dateOfBirth.year", value); }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <img alt="background" id="user-info-back-img" src={placeHolderImageSrc} />

            <div id="user-info-follow-btn" onClick={openProfileEditor} style={{ border: "1px solid", backgroundColor: "whitesmoke", color: "black" }}><b>Edit profile</b></div>

            <div id="user-info-user-img-container">
                <img
                    alt={"user"}
                    id="user-info-user-img"
                    src={userData?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />
            </div>

            <div id="user-info-body">
                <p id="user-info-username-text">{userData?.name ?? ''}</p>
                {userData?.username ? `@${userData.username}` : ''}

                {userData?.bio && <p id="user-info-bio-text">{userData.bio}</p>}

                <p className="font-size-16 mt-3">
                    {
                        statsList.map((statsObj, statsIndex) => {
                            let { icon, text, serverKey } = statsObj;

                            if ((text.length * 16) > totalLineLength) {
                                text = text.slice(0, 66) + "...";
                            }

                            const n = text.length;
                            let currentCoverage = (n + 1) * 16, addBreak = false;
                            currentCoverage += (statsIndex < _statsList.length - 1) ? 32 : 0;

                            if (currentCoverage > availableCoverage) {
                                addBreak = true;
                                availableCoverage = totalLineLength - currentCoverage;
                            } else {
                                availableCoverage -= currentCoverage;
                            }

                            return (
                                <React.Fragment key={statsIndex}>
                                    {addBreak && statsIndex > 0 && <br />}
                                    <CIcon size="sm" icon={icon} className="user-info-stat-icon" />
                                    <span title={serverKey === "website" && details?.website ? details.website : ''}>
                                        &nbsp;
                                        {
                                            serverKey === "website" && websiteLink ? (
                                                <a className="span-link" href={websiteLink}>{text ?? ''}</a>
                                            ) : (
                                                <>{text ?? ''}</>
                                            )
                                        }
                                        &nbsp;&nbsp;
                                    </span>
                                </React.Fragment>
                            );
                        })
                    }
                </p>

                <div className="d-flex justify-content-start">
                    <div className="mr-2"><b>{userData?.following ?? 0}</b>&nbsp;Following</div>
                    <div className="ml-2"><b>{userData?.followers ?? 0}</b>&nbsp;Followers</div>
                </div>
            </div>

            {
                showProfileEditor && (
                    <CustomModal
                        includeHeader={true}
                        displayOverflow={true}
                        bodyJSX={editProfileBodyJSX}
                        bodyClasses={"ml-0 mr-0 p-0 mt-4"}
                        customHeaderJSX={editProfileHeaderJSX}
                    />
                )
            }
        </div>
    );
};

export default UserInfo;
