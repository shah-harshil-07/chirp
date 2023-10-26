import React from "react";

const App = React.lazy(() => import("src/App"));
const Dashboard = React.lazy(() => import("src/dashbard"));

const routes = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Dashboard />,
            },
        ],
    },
];

export default routes;
