import "src/styles/sidebar/index.css";
import "src/styles/sidebar/left-sidebar.css";

import React, { useRef, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilHome, cilSettings, cilBookmark, cilUser, cilOptions } from "@coreui/icons";

import { getUserDetails, isUserLoggedIn } from "src/utilities/helpers";
import Confirmation from "../utilities/confirmation";

const LeftSidebar = () => {
    const logo = require("src/assets/logo-1.png");
    const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

    const userDetails = getUserDetails(), actionbarRef = useRef(null), actionIconRef = useRef(null);

    const [viewActionbar, setViewActionbar] = useState(false);
    const [openLogoutConfirmation, setOpenLogoutConfirmation] = useState(false);

    document.addEventListener("click", e => {
        e.stopImmediatePropagation();

        if (
            !actionbarRef?.current?.contains(e.target) &&
            !actionIconRef?.current?.contains(e.target)
        ) {
            setViewActionbar(false);
        }
    });

    const logoutUser = () => {
        localStorage.removeItem("chirp-accessToken");
        localStorage.removeItem("chirp-userDetails");
        setOpenLogoutConfirmation(false);
        window.location.reload();
    }

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

                <div id="left-sidebar-chirp-btn">Post</div>

                <div>
                    {
                        viewActionbar && (
                            <div className="left-sidebar-user-actionbar" ref={actionbarRef}>
                                <div className="left-sidebar-user-action" onClick={() => { setOpenLogoutConfirmation(true); }}>
                                    <b>Log out {`@${userDetails?.username ?? ''}`}</b>
                                </div>
                            </div>
                        )
                    }
                    {
                        isUserLoggedIn() && userDetails?.name && userDetails?.username && (
                            <div className="row" id="left-sidebar-profile-container">
                                <div id="profile-image-container">
                                    <img
                                        alt="logo"
                                        className="sidebar-profile-img"
                                        src={userDetails.picture ? userDetails.picture : placeHolderImageSrc}
                                    />
                                </div>

                                <div style={{ fontSize: "19px" }}>
                                    &nbsp;{userDetails?.name ?? ''}<br />{`@${userDetails?.username ?? ''}`}
                                </div>

                                <CIcon
                                    icon={cilOptions}
                                    ref={actionIconRef}
                                    className="options-icon"
                                    style={{ marginLeft: "21px" }}
                                    onClick={() => { setViewActionbar(!viewActionbar); }}
                                />
                            </div>
                        )
                    }
                </div>

                {
                    openLogoutConfirmation && (
                        <Confirmation
                            headingText={"Logout"}
                            handleConfirmAction={logoutUser}
                            message={`Are you sure you want to logout?`}
                            handleCloseAction={() => { setOpenLogoutConfirmation(false); }}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default LeftSidebar;
