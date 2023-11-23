import React from "react";

import Form from "src/components/form";
import Posts from "src/components/posts";
import { isUserLoggedIn } from "src/utilities/helpers";

const Dashboard = () => <div><p id="app-header">Home</p>{isUserLoggedIn() && <Form />}<Posts /></div>;
export default Dashboard;
