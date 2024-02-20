import React from "react";

import Form from "src/components/form";
import { isUserLoggedIn } from "src/utilities/helpers";
import PostUtilities from "./components/utilities/posts";

const Dashboard = () => {
    return <div><p id="app-header">Home</p>{isUserLoggedIn() && <Form />}<PostUtilities /></div>;
};

export default Dashboard;
