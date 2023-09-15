import React, { useRef, useState } from "react";

import CIcon from "@coreui/icons-react";
import { cilImage, cilSmile } from "@coreui/icons";
import CustomModal from "../utilities/custom-modal";
import EmojiContainer from "../form/emoji-container";
import usePostServices from "src/custom-hooks/post-services";
import { placeHolderImageSrc } from "src/utilities/constants";
import useImageConverter from "src/custom-hooks/image-converter";

const RepostEditor = post => {
    const { createdAt, user: postCreator, _id: postId } = post;
    const { name, username } = postCreator ?? {};
    const fileUploadRef = useRef(null), bodyClasses = "mr-2 ml-2 mt-2";;
    const { uploadImagesAction } = useImageConverter(), { getPostTiming } = usePostServices();

    const [text, setText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFileObjects, setUploadedFileObjects] = useState([]);

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

    const repost = () => {
        console.log(postId);
    }

    const bodyJSX = (
        <div className="comment-editor-body">
            <div className="position-relative" style={{ position: "relative", border: "2.5px solid rgba(0,0,0,.1)", borderRadius: "25px" }}>
                <img src={postCreator?.picture ?? placeHolderImageSrc} id="comment-editor-user-image" alt="post creator" />

                <div id="comment-editor-card-body">
                    <div className="row mx-0">
                        <b className="font-size-20">{name}</b>&nbsp;
                        <span className="font-size-20">{`@${username}`}</span>
                        <span><div className="mt-1" id="seperator-container"><div id="seperator" /></div></span>
                        <span className="font-size-20">{getPostTiming(createdAt)}</span>
                    </div>

                    <div className="row mx-0 mt-3 font-size-20"><div>{post?.text?.slice(0, 40) ?? ''}</div></div>

                    <p className="mt-3">Replying to <span className="text-chirp-color">{`@${username}`}</span></p>
                </div>
            </div>
        </div>
    );

    const footerJSX = (
        <div className="comment-editor-footer-body">
            <div className="comment-editor-footer-icons">
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

            <div
                onClick={repost}
                style={{ opacity: text ? '1' : "0.4" }}
                className="chirp-button comment-editor-footer-action"
            >
                Repost
            </div>
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

export default RepostEditor;
