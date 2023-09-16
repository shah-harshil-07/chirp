import "src/styles/reactions/index.css";

import CIcon from "@coreui/icons-react";
import React, { useRef, useState } from "react";
import { cilImage, cilSmile } from "@coreui/icons";

import API from "src/api";
import { useDispatch } from "react-redux";
import ImgHolder from "../utilities/img-holder";
import CustomModal from "../utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import { closeModal } from "src/redux/actions/modal";
import { getUserDetails } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";
import EmojiContainer from "../utilities/emoji-container";
import usePostServices from "src/custom-hooks/post-services";
import { placeHolderImageSrc } from "src/utilities/constants";
import useImageConverter from "src/custom-hooks/image-converter";

const CommentEditor = post => {
    const { createdAt, poll, user: postCreator, _id: postId } = post;
    const userDetails = getUserDetails() ?? {};
    const { name, username } = postCreator ?? {};
    const { picture: userPictureUrl } = userDetails;
    const { showError, showSuccess } = useToaster(), dispatch = useDispatch();
    const { getPostTiming } = usePostServices(), fileUploadRef = useRef(null);
    const { uploadImagesAction } = useImageConverter(), textboxRef = useRef(null);

    const [text, setText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFileObjects, setUploadedFileObjects] = useState([]);

    const bodyClasses = "mr-2 ml-2 mt-2";

    const createComment = async () => {
        if (text) {
            const data = { text, postId };
            const formData = new FormData();
            formData.append("data", JSON.stringify(data));

            uploadedFileObjects.forEach(fileObj => { formData.append("images[]", fileObj); });

            try {
                const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
                const response = await API(Constants.POST, Constants.CREATE_COMMENT, formData, headerData);
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

    const getGradient = votePercent => {
        return `linear-gradient(to right, #e9ecef ${votePercent}%, white ${votePercent}% 100%)`;
    }

    const pollJSX = pollData => {
        const { choices } = pollData;
        const totalVotes = choices.reduce((votesAcc, { votes }) => votesAcc += votes, 0);

        return (
            <div className="mt-3 mb-3">
                {
                    choices.map((choiceObj, choiceIndex) => {
                        const { label, votes } = choiceObj;
                        const votePercent = Math.ceil(votes / totalVotes * 100);

                        return (
                            <div
                                key={choiceIndex}
                                className="post-poll-bar"
                                style={{ background: getGradient(votePercent) }}
                            >
                                {label ?? ''}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    const bodyJSX = (
        <div className="reaction-editor-body">
            <div className="position-relative">
                <img src={postCreator?.picture ?? placeHolderImageSrc} className="reaction-editor-user-image" alt="post creator" />

                <div className="reaction-editor-card-body">
                    <div className="row mx-0">
                        <b className="font-size-20">{name}</b>&nbsp;
                        <span className="font-size-20">{`@${username}`}</span>
                        <span><div className="mt-1" id="seperator-container"><div id="seperator" /></div></span>
                        <span className="font-size-20">{getPostTiming(createdAt)}</span>
                    </div>

                    <div className="row mx-0 mt-3 font-size-20"><div>{post?.text?.slice(0, 40) ?? ''}</div></div>

                    {poll?.choices && pollJSX(poll)}

                    <p className="mt-3">Replying to <span className="text-chirp-color">{`@${username}`}</span></p>
                </div>
            </div>

            <form noValidate onSubmit={createComment} className="mw-100 mt-3">
                <div className="reaction-editor-form-body">
                    <img src={userPictureUrl ?? placeHolderImageSrc} className="reaction-editor-commentor-img" alt="user" />

                    <div className="reaction-editor-data-container">
                        <textarea
                            value={text}
                            ref={textboxRef}
                            onChange={handleTextChange}
                            className="reaction-editor-text-area"
                            placeholder="Post your comment here!"
                        />
                        <br />
                        <ImgHolder removeImage={index => { spliceImage(index); }} images={uploadedFiles} />
                    </div>
                </div>
            </form>
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
                onClick={createComment}
                style={{ opacity: text ? '1' : "0.4" }}
                className="chirp-button reaction-editor-footer-action"
            >
                Comment
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

export default CommentEditor;
