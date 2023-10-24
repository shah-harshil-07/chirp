import "src/styles/utilities/loader.css";

import React from "react";

const Loader = () => {
    return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status" />
        </div>
    )
}

export default Loader;
