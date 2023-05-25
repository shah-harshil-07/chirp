import "src/styles/form/scheduled-post-editor.css";

import React, { useEffect } from "react";

import Form from "./index";
import CustomModal from "../utilities/custom-modal";

const ScheduledPostEditor = props => {
    useEffect(() => {
        if (props?.images?.length) {
            const b64Data = props.images[0];
            var contentType = "image/*", sliceSize = 512;

            var byteCharacters = window.atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            const file = new File([blob], "sample-img.jpeg");
            const reader = new FileReader();
            reader.onload = e => {
                console.log(e.target.result);
            }
            reader.readAsDataURL(file);
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
