import React from "react";

import Form from "src/components/form";
import Posts from "src/components/posts";
import { isUserLoggedIn } from "src/utilities/helpers";
import UserCard from "src/components/utilities/user-card";

const Dashboard = () => {
    return (
        <div>
            <p id="app-header">Home</p>
            {isUserLoggedIn() && <Form />}
            <UserCard />
            <Posts />
        </div>
    );
};

export default Dashboard;
