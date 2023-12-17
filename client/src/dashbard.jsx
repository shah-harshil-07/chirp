import React from "react";
import { useSelector } from "react-redux";

import Form from "src/components/form";
import Posts from "src/components/posts";
import { isUserLoggedIn } from "src/utilities/helpers";
import UserCard from "src/components/utilities/user-card";

const Dashboard = () => {
    const userDetailState = useSelector(state => state.userDetails);

    return (
        <div>
            <p id="app-header">Home</p>
            {isUserLoggedIn() && <Form />}
            {userDetailState.open && <UserCard />}
            <Posts />
        </div>
    );
};

export default Dashboard;
