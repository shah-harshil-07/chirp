import React, { useRef, useState } from "react";

import * as Constants from "src/utilities/constants";
import ImgHolder from "../utilities/img-holder";
import CIcon from "@coreui/icons-react";
import { cilImage, cilSmile } from "@coreui/icons";
import useImageConverter from "src/custom-hooks/image-converter";
import EmojiContainer from "../utilities/emoji-container";

const ReplyBox = ({ username }) => {
    const fileUploadRef = useRef(null);
    const { uploadImagesAction } = useImageConverter();

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
        console.log(e);
    }

    const postComment = () => {

    }

    return (
        <>
            {
                username && (
                    <div style={{ marginLeft: "45px", marginTop: "10px" }}>
                        Replying to
                        <span className="text-chirp-color">{` @${username}`}</span>
                    </div>
                )
            }

            <div className="d-flex">
                <img
                    alt="user"
                    className="post-user-image"
                    src={Constants.placeHolderImageSrc}
                    style={{ width: "50px", height: "50px" }}
                />

                <textarea
                    className="special-input"
                    style={{ marginLeft: "70px" }}
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

                    <div onClick={postComment} className="chirp-button">Reply</div>
                </div>
            </div>
        </>
    );
};

export default ReplyBox;
