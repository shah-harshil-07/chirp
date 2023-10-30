import React from "react";

const App = React.lazy(() => import("src/App"));
const Dashboard = React.lazy(() => import("src/dashbard"));
const CommentList = React.lazy(() => import("src/components/reactions/comment-list"));

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
                element: <CommentList />,
            }
        ],
    },
];

export default routes;
