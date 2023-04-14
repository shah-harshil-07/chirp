import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

import React from "react";

const RightSidebar = () => {
    const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

    return (
        <div className="sidebar">
            <div id="right-sidebar-container">
                <input type="text" id="special-input" className="right-sidebar-searchbox" placeholder="Search Chirp" />

                <div id="trending-section">
                    <div className="right-sidebar-section-header">
                        <b>What's happening</b>
                    </div>

                    <div className="trending-section-margin-text">
                        <span>Trending in India</span>
                        <span className="float-right">#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div className="trending-section-margin-text">
                        <span>Trending in India</span>
                        <span className="float-right">#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div className="trending-section-margin-text">
                        <span>Trending in India</span>
                        <span className="float-right">#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div className="trending-section-margin-text">
                        <span>Trending in India</span>
                        <span className="float-right">#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div className="trending-section-margin-text">
                        <span>Trending in India</span>
                        <span className="float-right">#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
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

                        <div style={{ fontSize: "16px" }}>
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <span style={{ marginLeft: "57px" }}>#</span>
                    </div>

                    <div className="row who-to-follow-user-div">
                        <div className="user-div-img-container">
                            <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                        </div>

                        <div style={{ fontSize: "16px" }}>
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <span style={{ marginLeft: "57px" }}>#</span>
                    </div>

                    <div className="row who-to-follow-user-div">
                        <div className="user-div-img-container">
                            <img alt="logo" className="sidebar-profile-img" src={placeHolderImageSrc} />
                        </div>

                        <div style={{ fontSize: "16px" }}>
                            &nbsp;Harshil Shah<br />@shah_harshil_07
                        </div>

                        <span style={{ marginLeft: "57px" }}>#</span>
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
