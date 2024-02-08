import React from "react";

import UserDetails from "./components/user";

const App = React.lazy(() => import("src/App"));
const Dashboard = React.lazy(() => import("src/dashbard"));
const Page404 = React.lazy(() => import("src/components/404"));
const PostDetails = React.lazy(() => import("src/components/reactions/post-details"));

const routes = [
    {
        path: '/',
        element: <App />,
        errorElement: <Page404 />,
        children: [
            { path: '/', element: <Dashboard /> },
            { path: "/post/:postId", element: <PostDetails /> },
            { path: "/user/:userId", element: <UserDetails /> }
        ],
    },
];

export default routes;
