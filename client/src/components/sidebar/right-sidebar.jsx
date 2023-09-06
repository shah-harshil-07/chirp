import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

import React from "react";
import CIcon from "@coreui/icons-react";
import { cilOptions } from "@coreui/icons";
import { placeHolderImageSrc } from "src/utilities/constants";

const RightSidebar = () => {
    return (
        <div className="sidebar">
            <div id="right-sidebar-container">
                <input type="text" className="right-sidebar-searchbox special-input" placeholder="Search Chirp" />

                <div id="trending-section">
                    <div className="right-sidebar-section-header">
                        <b>What's happening</b>
                    </div>

                    <div className="trending-section-margin-text" style={{ fontSize: "17px" }}>
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text" style={{ fontSize: "17px" }}>
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text" style={{ fontSize: "17px" }}>
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text" style={{ fontSize: "17px" }}>
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div id="trending-section-show-more">
                        <span>Show More</span>
                    </div>
                </div>

                <div id="who-to-follow-section">
                    <div className="right-sidebar-section-header"><b>Who to follow</b></div>

                    <div className="row who-to-follow-user-div">
                        <div className="user-div-img-container">
                            <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                        </div>

                        <div className="who-to-follow-user-details">
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <div className="common-custom-btn">Follow</div>
                    </div>

                    <div className="row who-to-follow-user-div">
                        <div className="user-div-img-container">
                            <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                        </div>

                        <div className="who-to-follow-user-details">
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <div className="common-custom-btn">Follow</div>
                    </div>

                    <div className="row who-to-follow-user-div">
                        <div className="user-div-img-container">
                            <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                        </div>

                        <div className="who-to-follow-user-details">
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <div className="common-custom-btn">Follow</div>
                    </div>

                    <div id="who-to-follow-show-more">
                        <span>Show More</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RightSidebar;
