import "src/styles/comments/comment-editor.css";

import CIcon from "@coreui/icons-react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { cilImage, cilSmile } from "@coreui/icons";

import CustomModal from "../utilities/custom-modal";
import EmojiContainer from "../form/emoji-container";
// import { getUserDetails } from "src/utilities/helpers";
import usePostServices from "src/custom-hooks/post-services";
import { placeHolderImageSrc } from "src/utilities/constants";
import useImageConverter from "src/custom-hooks/image-converter";
import ImgHolder from "../form/img-holder";

const CommentEditor = post => {
    const { createdAt, user } = post;
    // const userDetails = getUserDetails();
    const { name, username } = user ?? {};
    const { getPostTiming } = usePostServices(), fileUploadRef = useRef(null);
    const { uploadImagesAction } = useImageConverter(), textboxRef = useRef(null);

    const [text, setText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFileObjects, setUploadedFileObjects] = useState([]);

    const bodyClasses = "mr-2 ml-2 mt-2";

    const createComment = () => {

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

    const spliceImage = index => {
        let _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

        _uploadedFiles.splice(index, 1);
        if (_uploadedFileObjects[index]) _uploadedFileObjects.splice(index, 1);

        setUploadedFiles([..._uploadedFiles]);
        setUploadedFileObjects([..._uploadedFileObjects]);
    }

    const handleEmojiSelect = e => {
        setText(`${text}${e.emoji}`);
    }

    const handleTextChange = e => {
        setText(e.target.value);
        textboxRef.current.style.height = `${textboxRef.current.scrollHeight}px`;
    }

    const bodyJSX = (
        <div className="comment-editor-body">
            <div className="position--relative">
                <img src={user?.picture ?? placeHolderImageSrc} id="comment-editor-user-image" alt="user" />

                <div id="comment-editor-card-body">
                    <div className="row mx-0">
                        <b style={{ fontSize: "20px" }}>{name}</b>&nbsp;
                        <span style={{ fontSize: "20px" }}>{`@${username}`}</span>
                        <span><div className="mt-1" id="seperator-container"><div id="seperator" /></div></span>
                        <span style={{ fontSize: "20px" }}>{getPostTiming(createdAt)}</span>
                    </div>

                    <div className="row mx-0 mt-3" style={{ fontSize: "20px" }}><div>{post?.text?.slice(0, 40) ?? ''}</div></div>

                    <p className="mt-3">Replying to <span className="text-chirp-color">{`@${username}`}</span></p>
                </div>
            </div>

            <form noValidate onSubmit={createComment} className="mw-100 mt-3">
                <div className="d-flex" style={{ overflowY: "hidden" }}>
                    <div><img src={placeHolderImageSrc} id="comment-editor-commenter-img" alt="user" /></div>

                    <div className="w-100 mw-100 h-100" style={{ marginLeft: "6px" }}>
                        <textarea value={text} onChange={handleTextChange} ref={textboxRef} placeholder="Post your comment here!" className="w-100" style={{ border: "0px", outline: "none", fontSize: "22px" }} />
                        <br />
                        <ImgHolder removeImage={index => { spliceImage(index); }} images={uploadedFiles} />
                    </div>
                </div>
            </form>
        </div>
    );

    const footerJSX = (
        <div style={{ position: "absolute", bottom: '0', left: "27px" }}>
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
                datatype="emoji-icon"
                className="action-icon"
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}
            />
            {
                showEmojiPicker && (
                    <EmojiContainer
                        callbackKey={"comment-emoji-bar"}
                        handleEmojiSelect={handleEmojiSelect}
                        handleClickOutside={() => { setShowEmojiPicker(false); }}
                    />
                )
            }
        </div>
    );

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            includeFooter={true}
            includeHeader={false}
            displayOverflow={false}
            bodyClasses={bodyClasses}
            customFooterJSX={footerJSX}
        />
    );
}

export default CommentEditor;
