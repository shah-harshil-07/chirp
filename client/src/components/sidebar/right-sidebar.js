import "src/styles/sidebar/index.css";

import React from "react";

const RightSidebar = () => {
    return (
        <div className="sidebar">
            <div style={{ width: "300px", marginLeft: "30px" }}>
                <input type="text" placeholder="Search Chirp" />

                <div style={{ border: "2px solid black", marginTop: "40px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "20px", backgroundColor: "rgb(247 249 249)" }}>
                    <div><b>What's happening</b></div>

                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <span>Trending in India</span>
                        <span style={{ float: "right" }}>#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <span>Trending in India</span>
                        <span style={{ float: "right" }}>#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <span>Trending in India</span>
                        <span style={{ float: "right" }}>#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <span>Trending in India</span>
                        <span style={{ float: "right" }}>#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <span>Trending in India</span>
                        <span style={{ float: "right" }}>#</span><br />
                        <span><b>Hello World</b></span> <br />
                        <span>87.7k posts</span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#1DA1F2" }}>
                        <span>Show More</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RightSidebar;
