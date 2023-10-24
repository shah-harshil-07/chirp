import "src/styles/form/scheduled-post-editor.css";

import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";

import API from "src/api";
import Form from "./index";
import CustomModal from "../utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import { closeModal } from "src/redux/reducers/modal";
import { getCommonHeader } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";

const ScheduledPostEditor = props => {
    const { showError, showSuccess } = useToaster();
    const dispatch = useDispatch(), headerData = getCommonHeader();

    const [editText, setEditText] = useState('');
    const [editUploadedFileObjects, setEditUploadedFileObjects] = useState([]);
    const [editUploadedFiles, setEditUploadedFiles] = useState([]);
    const [editPollData, setEditPollData] = useState(null);
    const [editSchedule, setEditSchedule] = useState(null);
    const [postId, setPostId] = useState('');

    useEffect(() => {
        const { data, schedule, id } = props;
        const { images, poll, text } = data ? data : {};

        const imageObjects = images.map(imageObj => imageObj.image);
        const fileObjects = images.map(imageObj => imageObj.file);

        if (id) setPostId(id);

        setEditText(text);
        setEditPollData(poll);
        setEditSchedule(schedule);
        setEditUploadedFiles([ ...imageObjects ]);
        setEditUploadedFileObjects([ ...fileObjects ]);
    }, [props]);

    const editScheduledPost = async data => {
        try {
            if (postId) {
                const url = `${Constants.RESCHEDULE_POST}/${postId}`;
                const response = await API(Constants.POST, url, data, headerData);
                const responseData = response.data;

                const alert = responseData?.meta?.status ? showSuccess : showError;
                const message = responseData?.meta?.message ?? '';
                if (message) alert(message);
                dispatch(closeModal());
            }
        } catch (error) {
            console.log(error);
            showError("Something went wrong!");
            dispatch(closeModal());
        }
    }

    const bodyJSX = (
        <Form
            editText={editText}
            editScheduleMode={true}
            editPollData={editPollData}
            editSchedule={editSchedule}
            editUploadedFiles={editUploadedFiles}
            editScheduledPost={editScheduledPost}
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
