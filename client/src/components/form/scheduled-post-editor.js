import React, { useEffect } from "react";

import CustomModal from "../utilities/custom-modal";
import Form from "./index";

const ScheduledPostEditor = props => {
    useEffect(() => {
        console.log("props obtained => ", props);
    }, [props]);

    const bodyJSX = (
        <Form />
    )

    return (
        <CustomModal bodyJSX={bodyJSX} />
    )
}

export default ScheduledPostEditor;
