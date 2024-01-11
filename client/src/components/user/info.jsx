import "src/styles/user/info.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { cilCalendar, cilBirthdayCake, cilLink, cilLocationPin } from "@coreui/icons";

import CustomModal from "../utilities/custom-modal";
import { placeHolderImageSrc } from "src/utilities/constants";
import { openModal } from "src/redux/reducers/modal";

const UserInfo = ({ details }) => {
    const totalLineLength = 1040;
    const dispatch = useDispatch();
    let availableCoverage = totalLineLength;
    const sampleUserImg = require("src/assets/sample-user.png");

    const _statsList = [
        { icon: cilLink, serverKey: "website", text: '' },
        { icon: cilCalendar, serverKey: "createdAt", text: '' },
        { icon: cilLocationPin, serverKey: "location", text: '' },
        { icon: cilBirthdayCake, serverKey: "dateOfBirth", text: '' },
    ];

    const [userData, setUserData] = useState({});
    const [websiteLink, setWebsiteLink] = useState('#');
    const [statsList, setStatsList] = useState([..._statsList]);

    useEffect(() => {
        if (details) {
            setUserData({ ...details });
            updateStats();
        }

        // eslint-disable-next-line
    }, [details]);

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
        dispatch(openModal({ type: "edit-profile" }));
    }

    const closeProfileEditor = () => {
        
    }

    const editProfileBodyJSX = (
        <div>Edit profile</div>
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
                                            serverKey === "website" ? (
                                                <a className="span-link" href={websiteLink}>{text}</a>
                                            ) : (
                                                <>{text}</>
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

            <CustomModal bodyJSX={editProfileBodyJSX} includeHeader={true} />
        </div>
    );
};

export default UserInfo;
