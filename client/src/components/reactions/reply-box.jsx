import React, { useRef, useState } from "react";

import CIcon from "@coreui/icons-react";
import { useNavigate } from "react-router-dom";
import { cilImage, cilSmile } from "@coreui/icons";

import API from "src/api";
import ImgHolder from "../utilities/img-holder";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import EmojiContainer from "../utilities/emoji-container";
import useImageConverter from "src/custom-hooks/image-converter";
import { getCommonHeader, getUserDetails } from "src/utilities/helpers";

const ReplyBox = ({ username, id, picture, type, originalPostId }) => {
    const userDetails = getUserDetails();
    const { showError, showSuccess } = useToaster();
    const { uploadImagesAction } = useImageConverter();
    const navigate = useNavigate(), textboxRef = useRef(null);
    const sampleUserImg = require("src/assets/sample-user.png");
    const fileUploadRef = useRef(null), headerData = getCommonHeader();

    const [text, setText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFileObjects, setUploadedFileObjects] = useState([]);

    const spliceImage = index => {
        let _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

        _uploadedFiles.splice(index, 1);
        if (_uploadedFileObjects[index]) _uploadedFileObjects.splice(index, 1);

        setUploadedFiles([..._uploadedFiles]);
        setUploadedFileObjects([..._uploadedFileObjects]);
    }

    const resetFileCache = () => {
        fileUploadRef.current.value = '';
    }

    const handleImageUpload = e => {
        const _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

        const readerLoadCallback = (e, fileObj) => {
            _uploadedFiles.push(e.target.result);
            _uploadedFileObjects.push(fileObj);

            setUploadedFiles([..._uploadedFiles]);
            setUploadedFileObjects([..._uploadedFileObjects]);
        }

        uploadImagesAction(e, readerLoadCallback, _uploadedFiles);
        resetFileCache();
    }

    const handleEmojiSelect = e => {
        setText(text + e.emoji);
    }

    const checkTextValidity = () => {
        return Boolean(text.trim());
    }

    const postComment = async () => {
        if (checkTextValidity()) {
            const data = { text };
            if (type === "comment") {
                data["parentCommentId"] = id;
                data["postId"] = originalPostId;
            } else {
                data["postId"] = id;
            }

            const formData = new FormData();
            formData.append("data", JSON.stringify(data));

            uploadedFileObjects.forEach(fileObj => { formData.append("images[]", fileObj); });

            try {
                const response = await API(Constants.POST, Constants.CREATE_COMMENT, formData, headerData);
                const responseData = response.data;

                const alert = responseData?.meta?.status ? showSuccess : showError;
                const message = responseData?.meta?.message ?? '';
                if (message) alert(message);

                setTimeout(() => { navigate(0); }, 5000);
            } catch (error) {
                console.log(error);
                showError("Something went wrong!");
            }
        }
    }

    const handleTextChange = e => {
		setText(e.target.value);
		textboxRef.current.style.height = `${textboxRef.current.scrollHeight}px`;
	}

    return (
        <>
            {
                username && (
                    <div id="reply-box-username">
                        Replying to
                        <span className="text-chirp-color">{` @${username}`}</span>
                    </div>
                )
            }

            <div className="d-flex">
                <img
                    alt="user"
                    className="post-detail-user-image"
                    src={userDetails?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />

                <textarea
                    value={text}
                    ref={textboxRef}
                    id="replybox-textarea"
                    className="special-input"
                    onChange={handleTextChange}
                    placeholder="Post your reply"
                />
            </div>

            <hr />

            <div className="h-auto">
                <ImgHolder removeImage={index => { spliceImage(index); }} images={uploadedFiles} />

                <div className={`${uploadedFiles.length > 0 ? "mt-3" : ''}`}>
                    <CIcon
                        size="sm"
                        title="Image"
                        icon={cilImage}
                        className="action-icon"
                        onClick={() => { fileUploadRef.current.click(); }}
                    />
                    <input
                        multiple
                        type="file"
                        accept="image/*"
                        className="d-none"
                        ref={fileUploadRef}
                        onChange={handleImageUpload}
                    />

                    <CIcon
                        size="sm"
                        title="Emoji"
                        icon={cilSmile}
                        className="action-icon"
                        onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}
                    />
                    {
                        showEmojiPicker && (
                            <EmojiContainer
                                callbackKey={"form-emoji-bar"}
                                handleEmojiSelect={handleEmojiSelect}
                                handleClickOutside={() => { setShowEmojiPicker(false); }}
                            />
                        )
                    }

                    <div
                        onClick={postComment}
                        className="chirp-button"
                        style={{ opacity: checkTextValidity() ? '1' : "0.4" }}
                    >
                        Reply
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReplyBox;
