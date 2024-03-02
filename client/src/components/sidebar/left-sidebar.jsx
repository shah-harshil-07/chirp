import "src/styles/sidebar/index.css";
import "src/styles/sidebar/left-sidebar.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDocumentClickServices from "src/custom-hooks/document-services";
import { cilHome, cilBookmark, cilUser, cilOptions } from "@coreui/icons";

import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { openConfirmation } from "src/redux/reducers/confirmation";
import { getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const LeftSidebar = () => {
    const dispatch = useDispatch();
    const { showError } = useToaster();
    const { moveToUserPage } = usePostServices();
    const logo = require("src/assets/logo-1.png");
    const navigate = useNavigate(), location = useLocation();
    const sampleUserImg = require("src/assets/sample-user.png");
    const { addDocumentClickCallback } = useDocumentClickServices();

    const userDetails = getUserDetails(), actionbarRef = useRef(null), actionIconRef = useRef(null);

    const [viewActionbar, setViewActionbar] = useState(false);

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
        navigate('/', { preventScrollReset: false });
        window.location.reload();
    }

    const moveToDashboard = () => {
        if (location.pathname === '/') window.scrollTo(0, 0);
        else navigate('/', { preventScrollReset: false });
    }

    const callMoveToUserPageFn = (e, viewSaved = false) => {
        if (userDetails?.id) moveToUserPage(e, userDetails.id, { state: { viewSaved } });
        else showError("Please login");
    }

    const openLogoutConfirmation = () => {
        const confirmationProps = {
            headingText: "Logout",
            handleConfirmAction: logoutUser,
            message: "Are you sure you want to logout?",
        };

        dispatch(openConfirmation(confirmationProps));
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

                    <div className="row left-sidebar-link" onClick={e => { callMoveToUserPageFn(e, true); }}>
                        <div className="col-sm-3 px-4 align-self-center">
                            <CIcon width={30} height={30} icon={cilBookmark} />
                        </div>

                        <div className="col-sm-9 left-sidebar-link-label">Bookmarks</div>
                    </div>

                    <div className="row left-sidebar-link" onClick={callMoveToUserPageFn}>
                        <div className="col-sm-3 px-4 align-self-center">
                            <CIcon width={30} height={30} icon={cilUser} />
                        </div>

                        <div className="col-sm-9 left-sidebar-link-label">Profile</div>
                    </div>
                </div>

                {
                    viewActionbar && (
                        <div className="left-sidebar-user-actionbar" ref={actionbarRef}>
                            <div onClick={openLogoutConfirmation} className="left-sidebar-user-action">
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
                                    onClick={callMoveToUserPageFn}
                                    className="sidebar-profile-img"
                                    src={userDetails.picture ?? String(sampleUserImg)}
                                    onError={e => { e.target.src = String(sampleUserImg); }}
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
    );
}

export default LeftSidebar;
