import "src/styles/form/scheduled-post-editor.css";

import React, { useEffect } from "react";

import CustomModal from "../utilities/custom-modal";
import Form from "./index";

const ScheduledPostEditor = props => {
    useEffect(async () => {
        console.log("props obtained => ", props);
        if (props?.images?.length) {
            const image = props.images[0];
            const blobImage = new Uint8ClampedArray(image);
            const blob = new Blob([blobImage]);
            const file = new File([blob], "sample-img.jpeg");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {
                console.log(e.target.result);
            };
            console.log(file);
        }
    }, [props]);

    return (
        <CustomModal
            bodyJSX={<Form />}
            includeHeader={false}
            bodyClasses={"mt-0 mr-0 ml-0"}
            modalContentClasses={"scheduled-post-content-class"}
        />
    )
}

export default ScheduledPostEditor;
