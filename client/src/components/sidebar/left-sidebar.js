import "src/styles/sidebar/index.css";
import "src/styles/sidebar/left-sidebar.css";

import React from "react";

const LeftSidebar = () => {
    const logo = require("src/assets/logo-1.png");

    return (
        <div className="sidebar">
            <div id="left-sidebar-container">
                <div id="chirp-icon-container">
                    <img alt="logo" width="40px" height="40px" src={String(logo)} />
                </div>

                <div className="left-sidebar-link" style={{ width: "142px" }}>
                    # Home
                </div>

                <div  className="left-sidebar-link" style={{ width: "154px" }}>
                    # Explore
                </div>

                <div  className="left-sidebar-link" style={{ width: "167px" }}>
                    # Settings
                </div>

                <div  className="left-sidebar-link" style={{ width: "190px" }}>
                    # Bookmarks
                </div>

                <div  className="left-sidebar-link" style={{ width: "143px" }}>
                    # Profile
                </div>

                <div className="left-sidebar-link" id="left-sidebar-chirp-btn">
                    Chirp
                </div>

                <div className="row" id="left-sidebar-profile-container">
                    <div id="profile-image-container">
                        <img alt="logo" id="left-sidebar-profile-img" src={String(logo)} />
                    </div>

                    <div style={{ fontSize: "19px" }}>
                        Harshil Shah<br />@shah_harshil_07
                    </div>

                    <span style={{ marginLeft: "21px" }}>#</span>
                </div>
            </div>
        </div>
    )
}

export default LeftSidebar;
