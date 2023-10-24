import React from "react";

import App from "./App";
import Dashboard from "./dashbard";

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
