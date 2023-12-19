import React from "react";
import CIcon from "@coreui/icons-react";
import { useNavigate } from "react-router-dom";
import { cilArrowLeft, cilCalendar, cilBirthdayCake, cilLink, cilLocationPin } from "@coreui/icons";

const UserInfo = () => {
    const navigate = useNavigate();
    const sampleUserImg = require("src/assets/sample-user-img.jpeg");

    const totalLineLength = 1040;
    let availableCoverage = totalLineLength;

    const statsList = [
        { icon: cilLocationPin, text: "Mumbai, Maharashtra" },
        { icon: cilLink, text: "https://www.linkedin.com/in/harshil-shah-612b3418a/" },
        { icon: cilBirthdayCake, text: "Born December 16" },
        { icon: cilCalendar, text: "Joined April 25" },
    ];

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
                    Christiano Ronaldo
                    <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "normal" }}>4000 posts</div>
                </div>
            </div>

            <div>
                <img alt="background" src="https://pbs.twimg.com/profile_banners/155659213/1668980773/600x200" />

                <div style={{ float: "right", backgroundColor: "black", color: "white", padding: "5px 15px 5px 15px", borderRadius: "20px", marginTop: "10px", cursor: "pointer" }}>
                    <b>Following</b>
                </div>

                <div style={{ width: "150px", height: "150px", marginTop: "-75px", marginLeft: "20px" }}>
                    <img alt={"user"} src={String(sampleUserImg)} className="w-100 h-100" style={{ border: "1px solid", borderRadius: "50%" }} />
                </div>

                <div style={{ marginLeft: "20px" }}>
                    <p style={{ fontWeight: "bold", marginTop: "10px", marginBottom: "0.1rem", fontSize: "18px" }}>
                        Christiano Ronaldo
                    </p>
                    @Christiano

                    <p style={{ marginTop: "10px" }}>This Privacy Policy addresses the collection and use of personal information - http://cristianoronaldo.com/terms</p>

                    <p style={{ fontSize: "16px" }}>
                        {
                            statsList.map((statsObj, statsIndex) => {
                                const { icon, text } = statsObj;
                                const n = text.length;
                                let currentCoverage = (n + 1) * 16, addBreak = false;
                                currentCoverage += (statsIndex < statsList.length - 1) ? 32 : 0;

                                if (currentCoverage > availableCoverage) {
                                    addBreak = true;
                                    availableCoverage = totalLineLength;
                                } else {
                                    availableCoverage -= currentCoverage;
                                }

                                return (
                                    <React.Fragment key={statsIndex}>
                                        {addBreak && <br />}
                                        <CIcon size="sm" icon={icon} style={{ width: "16px", height: "16px" }} />
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
