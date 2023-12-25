import React from "react";
import { useSelector } from "react-redux";

import Form from "src/components/form";
import { isUserLoggedIn } from "src/utilities/helpers";
import UserCard from "src/components/utilities/user-card";
import PostUtilities from "./components/utilities/posts";

const Dashboard = () => {
    const userDetailState = useSelector(state => state.userDetails);

    return (
        <div>
            <p id="app-header">Home</p>
            {isUserLoggedIn() && <Form />}
            {userDetailState.open && <UserCard />}
            <PostUtilities />
        </div>
    );
};

export default Dashboard;
