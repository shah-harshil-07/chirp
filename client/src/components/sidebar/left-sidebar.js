import "src/styles/sidebar/index.css";
import "src/styles/sidebar/left-sidebar.css";

import React from "react";
import CIcon from "@coreui/icons-react";
import { cilHome, cilSettings, cilBookmark, cilUser, cilOptions } from "@coreui/icons";

const LeftSidebar = () => {
    const logo = require("src/assets/logo-1.png");
    const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

    return (
        <div className="sidebar">
            <div id="left-sidebar-container">
                <div id="chirp-icon-container">
                    <img alt="logo" width="40px" height="40px" src={String(logo)} />
                </div>

                <div className="row left-sidebar-link">
                    <div className="col-sm-3 px-4 align-self-center">
                        <CIcon width={30} height={30} icon={cilHome} />
                    </div>

                    <div className="col-sm-9 left-sidebar-link-label">Home</div>
                </div>

                <div className="row left-sidebar-link">
                    <div className="col-sm-3 px-4 align-self-center">
                        <span style={{ fontSize: "33px", marginLeft: "5px" }}>#</span>
                    </div>

                    <div className="col-sm-9 left-sidebar-link-label">Explore</div>
                </div>

                <div className="row left-sidebar-link">
                    <div className="col-sm-3 px-4 align-self-center">
                        <CIcon width={30} height={30} icon={cilSettings} />
                    </div>

                    <div className="col-sm-9 left-sidebar-link-label">Settings</div>
                </div>

                <div className="row left-sidebar-link">
                    <div className="col-sm-3 px-4 align-self-center">
                        <CIcon width={30} height={30} icon={cilBookmark} />
                    </div>

                    <div className="col-sm-9 left-sidebar-link-label">Bookmarks</div>
                </div>

                <div className="row left-sidebar-link">
                    <div className="col-sm-3 px-4 align-self-center">
                        <CIcon width={30} height={30} icon={cilUser} />
                    </div>

                    <div className="col-sm-9 left-sidebar-link-label">Profile</div>
                </div>

                <div id="left-sidebar-chirp-btn">Chirp</div>

                <div className="row" id="left-sidebar-profile-container">
                    <div id="profile-image-container">
                        <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                    </div>

                    <div style={{ fontSize: "19px" }}>
                        &nbsp;Harshil Shah<br />@shah_harshil_07
                    </div>

                    <CIcon className="options-icon" style={{ marginLeft: "21px" }} icon={cilOptions} />
                </div>
            </div>
        </div>
    )
}

export default LeftSidebar;
