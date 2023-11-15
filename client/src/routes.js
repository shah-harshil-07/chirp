import React from "react";

const App = React.lazy(() => import("src/App"));
const Dashboard = React.lazy(() => import("src/dashbard"));
const PostDetails = React.lazy(() => import("src/components/reactions/post-details"));

const routes = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Dashboard />,
            },
            {
                path: "/post/:postId",
                element: <PostDetails />,
            }
        ],
    },
];

export default routes;
