import React from "react";

import Form from "src/components/form";
import Posts from "src/components/posts";
import { isUserLoggedIn } from "src/utilities/helpers";

const Dashboard = () => <div>{isUserLoggedIn() && <Form />}<Posts /></div>;
export default Dashboard;
