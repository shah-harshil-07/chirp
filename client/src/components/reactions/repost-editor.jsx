import "src/styles/reactions/index.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import { cilImage, cilSmile } from "@coreui/icons";

import API from "src/api";
import ImgHolder from "../utilities/img-holder";
import CustomModal from "../utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import { closeModal } from "src/redux/reducers/modal";
import { getUserDetails } from "src/utilities/helpers";
import { getCommonHeader } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";
import EmojiContainer from "../utilities/emoji-container";
import usePostServices from "src/custom-hooks/post-services";
import useImageConverter from "src/custom-hooks/image-converter";

const RepostEditor = post => {
    const { createdAt, user: postCreator, id: postId } = post;
    const headerData = getCommonHeader();
    const userDetails = getUserDetails() ?? {};
    const { name, username } = postCreator ?? {};
    const { picture: userPictureUrl } = userDetails;
    const sampleUserImg = require("src/assets/sample-user.png");
    const { showError, showSuccess } = useToaster(), dispatch = useDispatch();
    const { uploadImagesAction } = useImageConverter(), { getPostTiming } = usePostServices();
    const fileUploadRef = useRef(null), textboxRef = useRef(null), bodyClasses = "mr-2 ml-2 mt-2";

    const [text, setText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [parentPostImages, setParentPostImages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFileObjects, setUploadedFileObjects] = useState([]);

    useEffect(() => {
        setParentPostImages([...post?.images ?? []]);
        // eslint-disable-next-line
    }, [post]);

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

    const repost = async () => {
        if (text) {
            const data = { text, postId };
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));

            uploadedFileObjects.forEach(fileObj => { formData.append("images[]", fileObj); });

            try {
                const response = await API(Constants.POST, Constants.CREATE_POST, formData, headerData);
                const responseData = response.data;

                const alert = responseData?.meta?.status ? showSuccess : showError;
                const message = responseData?.meta?.message ?? '';
                if (message) alert(message);
            } catch (error) {
                console.log(error);
                showError("Something went wrong!");
            }

            dispatch(closeModal());
        }
    }

    const handleTextChange = e => {
        setText(e.target.value);
        textboxRef.current.style.height = `${textboxRef.current.scrollHeight}px`;
    }

    const spliceImage = index => {
        let _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

        _uploadedFiles.splice(index, 1);
        if (_uploadedFileObjects[index]) _uploadedFileObjects.splice(index, 1);

        setUploadedFiles([..._uploadedFiles]);
        setUploadedFileObjects([..._uploadedFileObjects]);
    }

    const bodyJSX = (
        <div className="reaction-editor-body">
            <form noValidate onSubmit={repost} className="mw-100 mt-3">
                <div className="reaction-editor-form-body">
                    <img
                        alt="user"
                        className="reaction-editor-commentor-img"
                        src={userPictureUrl ?? String(sampleUserImg)}
                        onError={e => { e.target.src = String(sampleUserImg); }}
                    />

                    <div className="reaction-editor-data-container">
                        <textarea
                            value={text}
                            ref={textboxRef}
                            style={{ width: "95%" }}
                            onChange={handleTextChange}
                            className="reaction-editor-text-area"
                            placeholder="Post your comment here!"
                        />
                        <br />
                        <ImgHolder removeImage={index => { spliceImage(index); }} images={uploadedFiles} />
                    </div>
                </div>
            </form>

            <div className="repost-body" style={uploadedFiles.length ? { marginTop: "10px" } : {}}>
                <img
                    alt="post creator"
                    className="reaction-editor-user-image"
                    src={postCreator?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />

                <div className="reaction-editor-card-body">
                    <div className="row mx-0">
                        <b className="font-size-20">{name}</b>&nbsp;
                        <span className="font-size-20">{`@${username}`}</span>
                        <span><div className="mt-1 seperator-container"><div className="seperator" /></div></span>
                        <span className="font-size-20">{getPostTiming(createdAt)}</span>
                    </div>

                    <div className="row mx-0 mt-3 font-size-20">
                        <div>
                            {(post?.text?.slice(0, 40) ?? '') + (post?.text?.length > 40 ? "..." : '')}
                        </div>
                    </div>

                    {parentPostImages?.length > 0 && <ImgHolder images={parentPostImages} showActionButtons={false} />}
                </div>
            </div>
        </div>
    );

    const footerJSX = (
        <div className="reaction-editor-footer-body">
            <div className="reaction-editor-footer-icons">
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
                            callbackKey={"reaction-emoji-bar"}
                            handleEmojiSelect={handleEmojiSelect}
                            handleClickOutside={() => { setShowEmojiPicker(false); }}
                        />
                    )
                }
            </div>

            <div
                onClick={repost}
                style={{ opacity: text ? '1' : "0.4" }}
                className="chirp-button reaction-editor-footer-action"
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
