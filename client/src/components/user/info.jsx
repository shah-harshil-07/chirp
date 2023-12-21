import "src/styles/user/info.css";

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

    const statsList = [
        { icon: cilLocationPin, text: "Mumbai, Maharashtra" },
        { icon: cilBirthdayCake, text: "Born Decemember 16" },
        { icon: cilLink, text: "https://www.linkedin.com/in/harshil-shah-612b3418a/" },
        { icon: cilCalendar, text: "Joined April 25" },
    ];

    const [userData, setUserData] = useState({});

    useEffect(() => {
        setUserData({ ...details });
    }, [details]);

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
                    <div id="user-info-header-sub-text">4000 posts</div>
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
                                let { icon, text } = statsObj;
                                let n = text.length, textShortened = false;

                                if ((n * 16) > totalLineLength) {
                                    text = text.slice(0, 66) + "...";
                                    n = text.length;
                                    textShortened = true;
                                }

                                let currentCoverage = (n + 1) * 16, addBreak = false;
                                currentCoverage += (statsIndex < statsList.length - 1) ? 32 : 0;

                                if (currentCoverage > availableCoverage || textShortened) {
                                    addBreak = true;
                                    availableCoverage = totalLineLength - currentCoverage;
                                } else {
                                    availableCoverage -= currentCoverage;
                                }

                                return (
                                    <React.Fragment key={statsIndex}>
                                        {addBreak && statsIndex > 0 && <br />}
                                        <CIcon size="sm" icon={icon} className="user-info-stat-icon" />
                                        &nbsp;{text}&nbsp;&nbsp;
                                    </React.Fragment>
                                );
                            })
                        }
                    </p>

                    <div className="d-flex justify-content-start">
                        <div className="mr-2"><b>695</b>&nbsp;Following</div>
                        <div className="ml-2"><b>33</b>&nbsp;Followers</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
