import "src/styles/user/info.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { cilArrowLeft, cilCalendar, cilBirthdayCake, cilLink, cilLocationPin } from "@coreui/icons";

import { placeHolderImageSrc } from "src/utilities/constants";

const UserInfo = ({ details }) => {
    const totalLineLength = 1040;
    const navigate = useNavigate();
    let availableCoverage = totalLineLength;
    const sampleUserImg = require("src/assets/sample-user.png");

    const _statsList = [
        { icon: cilLink, serverKey: "website", text: '' },
        { icon: cilCalendar, serverKey: "dateOfBirth", text: '' },
        { icon: cilLocationPin, serverKey: "location", text: '' },
        { icon: cilBirthdayCake, serverKey: "createdAt", text: '' },
    ];

    const [userData, setUserData] = useState({});
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

    const moveToHomePage = () => {
        navigate('/');
    }

    return (
        <div>
            <div className="common-header">
                <div className="common-heading-icon" onClick={moveToHomePage}>
                    <CIcon width={20} height={20} size="sm" icon={cilArrowLeft} />
                </div>

                <div className="common-heading-text">
                    {userData?.name ?? ''}
                    <div id="user-info-header-sub-text">{userData?.totalPosts ?? 0} posts</div>
                </div>
            </div>

            <div>
                <img alt="background" id="user-info-back-img" src={placeHolderImageSrc} />

                <div id="user-info-follow-btn"><b>Following</b></div>

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
                                        <span
                                            className={serverKey === "website" ? "span-link" : ''}
                                            title={serverKey === "website" && details?.website ? details.website : ''}
                                        >
                                            &nbsp;{text}&nbsp;&nbsp;
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
            </div>
        </div>
    );
};

export default UserInfo;
