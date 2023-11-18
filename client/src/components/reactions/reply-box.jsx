import React, { useRef, useState } from "react";

import CIcon from "@coreui/icons-react";
import { cilImage, cilSmile } from "@coreui/icons";

import API from "src/api";
import ImgHolder from "../utilities/img-holder";
import * as Constants from "src/utilities/constants";
import { getCommonHeader } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";
import EmojiContainer from "../utilities/emoji-container";
import useImageConverter from "src/custom-hooks/image-converter";

const ReplyBox = ({ username, postId }) => {
    const { showError, showSuccess } = useToaster();
    const { uploadImagesAction } = useImageConverter();
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
        setText(`${text}${e.emoji}`);
    }

    const postComment = async () => {
        if (text) {
            const data = { text, postId };
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));

            uploadedFileObjects.forEach(fileObj => { formData.append("images[]", fileObj); });

            try {
                const response = await API(Constants.POST, Constants.CREATE_COMMENT, formData, headerData);
                const responseData = response.data;

                const alert = responseData?.meta?.status ? showSuccess : showError;
                const message = responseData?.meta?.message ?? '';
                if (message) alert(message);

                window.location.reload();
            } catch (error) {
                console.log(error);
                showError("Something went wrong!");
            }
        }
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
                    src={Constants.placeHolderImageSrc}
                />

                <textarea
                    value={text}
                    className="special-input"
                    placeholder="Post your reply"
                    style={{ marginLeft: "70px" }}
                    onChange={e => { setText(e.target.value); }}
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

                    <div onClick={postComment} style={{ opacity: text ? '1' : "0.4" }} className="chirp-button">
                        Reply
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReplyBox;
