import React from "react";

import Form from "src/components/form";
import Posts from "src/components/posts";
import { isUserLoggedIn } from "src/utilities/helpers";
import { placeHolderImageSrc } from "./utilities/constants";

const Dashboard = () => {
    return (
        <div>
            <p id="app-header">Home</p>
            {isUserLoggedIn() && <Form />}
            <div style={{ position: "absolute", zIndex: 4, width: "300px", backgroundColor: "white", left: "464px", top: "260px", borderRadius: "20px", padding: "10px", boxShadow: "0 4px 8px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%)" }}>
                <div className="d-flex justify-content-between">
                    <img src={placeHolderImageSrc} width={50} height={50} style={{ borderRadius: "50%" }} />
                    <div style={{ backgroundColor: "whitesmoke", width: "100px", height: "30px", textAlign: "center", alignSelf: "center", paddingTop: "2.5px", borderRadius: "25px", paddingLeft: "12.5px", paddingRight: "12.5px" }}>Unfollow</div>
                </div>

                <div>
                    <b>Harshil Shah</b>
                    <p>@shah_harshil_07</p>
                </div>

                <p>Growth is life</p>

                <div className="d-flex justify-content-around">
                    <div><b>100</b>&nbsp;Following</div>
                    <div><b>150M</b>&nbsp;Followers</div>
                </div>
            </div>
            <Posts />
        </div>
    )
};
export default Dashboard;
