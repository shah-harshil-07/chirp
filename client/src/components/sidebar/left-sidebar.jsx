import "src/styles/sidebar/index.css";
import "src/styles/sidebar/left-sidebar.css";

import CIcon from "@coreui/icons-react";
import React, { useEffect, useRef, useState } from "react";
import useDocumentClickServices from "src/custom-hooks/document-services";
import { cilHome, cilSettings, cilBookmark, cilUser, cilOptions } from "@coreui/icons";

import { useNavigate } from "react-router-dom";
import Confirmation from "../utilities/confirmation";
import { placeHolderImageSrc } from "src/utilities/constants";
import { getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const LeftSidebar = () => {
    const navigate = useNavigate();
    const logo = require("src/assets/logo-1.png");
    const { addDocumentClickCallback } = useDocumentClickServices();

    const userDetails = getUserDetails(), actionbarRef = useRef(null), actionIconRef = useRef(null);

    const [viewActionbar, setViewActionbar] = useState(false);
    const [openLogoutConfirmation, setOpenLogoutConfirmation] = useState(false);

    useEffect(() => {
        const outsideClickFn = e => {
            e.stopImmediatePropagation();
            /* Above line will block all the event listeners of the element on which this event is invoked. The main difference between stopPropagation and stopImmediatePropagation is that former will stop propagation to furthur up or down the DOM tree. The latter will do the same but along with that it will not only block all the event listeners but also prevent other events on the same element from executing.*/

            if (
                !actionbarRef?.current?.contains(e.target) &&
                !actionIconRef?.current?.contains(e.target)
            ) {
                setViewActionbar(false);
            }
        }

        addDocumentClickCallback("profile-bar", outsideClickFn);
        // eslint-disable-next-line
    }, []);

    const logoutUser = () => {
        localStorage.removeItem("chirp-accessToken");
        localStorage.removeItem("chirp-userDetails");
        setOpenLogoutConfirmation(false);
        window.location.reload();
    }

    const moveToDashboard = () => {
        navigate('/');
    }

    return (
        <div className="sidebar" id="left-sidebar-main">
            <div id="left-sidebar-super-container">
                <div id="left-sidebar-container">
                    <div id="chirp-icon-container">
                        <img alt="logo" width="40px" height="40px" src={String(logo)} />
                    </div>

                    <div className="row left-sidebar-link" onClick={moveToDashboard}>
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

                    {
                        viewActionbar && (
                            <div className="left-sidebar-user-actionbar" ref={actionbarRef}>
                                <div
                                    className="left-sidebar-user-action"
                                    onClick={() => { setOpenLogoutConfirmation(true); }}
                                >
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
                                        alt="user"
                                        className="sidebar-profile-img"
                                        src={userDetails.picture ?? placeHolderImageSrc}
                                    />
                                </div>

                                <div id="left-sidebar-userbar-text">
                                    &nbsp;{userDetails?.name ?? ''}<br />{`@${userDetails?.username ?? ''}`}
                                </div>

                                <CIcon
                                    icon={cilOptions}
                                    ref={actionIconRef}
                                    className="options-icon"
                                    id="left-sidebar-options-icon"
                                    onClick={() => { setViewActionbar(!viewActionbar); }}
                                />
                            </div>
                        )
                    }
                </div>
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
    );
}

export default LeftSidebar;
