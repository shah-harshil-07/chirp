import React, { useEffect } from "react";

import CustomModal from "../utilities/custom-modal";
import Form from "./index";

const ScheduledPostEditor = props => {
    useEffect(() => {
        console.log("props obtained => ", props);
    }, [props]);

    return (
        <CustomModal
            bodyJSX={<Form />}
            includeHeader={false}
            bodyClasses={"mt-0 mr-0 ml-0"}
            modalContentClasses={"h-100"}
            displayOverflow={props?.images?.length > 0}
        />
    )
}

export default ScheduledPostEditor;
