import "src/styles/form/scheduled-post-editor.css";

import React, { useEffect, useState } from "react";

import Form from "./index";
import CustomModal from "../utilities/custom-modal";

const ScheduledPostEditor = props => {
    const [editText, setEditText] = useState('');
    const [editUploadedFileObjects, setEditUploadedFileObjects] = useState([]);
    const [editUploadedFiles, setEditUploadedFiles] = useState([]);
    const [editPollData, setEditPollData] = useState(null);
    const [editSchedule, setEditSchedule] = useState(null);

    useEffect(() => {
        const { data, schedule } = props;
        const { images, poll, text } = data;

        const imageObjects = images.map(imageObj => imageObj.image);
        const fileObjects = images.map(imageObj => imageObj.file);

        setEditText(text);
        setEditPollData({ ...poll });
        setEditSchedule({ ...schedule });
        setEditUploadedFiles([ ...imageObjects ]);
        setEditUploadedFileObjects([ ...fileObjects ]);
    }, [props]);

    const bodyJSX = (
        <Form
            editText={editText}
            editPollData={editPollData}
            editSchedule={editSchedule}
            editUploadedFiles={editUploadedFiles}
            editUploadedFileObjects={editUploadedFileObjects}
        />
    );

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            includeHeader={false}
            bodyClasses={"mt-0 mr-0 ml-0"}
            modalContentClasses={"scheduled-post-content-class"}
        />
    )
}

export default ScheduledPostEditor;
