import "src/styles/comments/comment-editor.css";

import React, { useState } from "react";
import CustomModal from "../utilities/custom-modal";
import { getUserDetails } from "src/utilities/helpers";
import usePostServices from "src/custom-hooks/post-services";
import { placeHolderImageSrc } from "src/utilities/constants";
import CIcon from "@coreui/icons-react";
import { cilImage } from "@coreui/icons";

const CommentEditor = post => {
    const { createdAt, user } = post;
    const userDetails = getUserDetails();
    const { name, username } = user ?? {};
    const { getPostTiming } = usePostServices();

    const [text, setText] = useState('');

    const bodyClasses = "mr-2 ml-2 mt-2";

    const handleSubmit = () => {

    }

    const bodyJSX = (
        <>
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

            <form noValidate onSubmit={handleSubmit} className="mw-100 mt-3">
                <div className="d-flex">
                    <div><img src={placeHolderImageSrc} id="comment-editor-commenter-img" alt="user" /></div>

                    <div className="w-100 mw-100">
                        <textarea
                            value={text}
                            className="special-input"
                            placeholder="Post your reply!"
                            onChange={e => setText(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ position: "fixed", bottom: "5px" }}>
                    <CIcon
                        size="sm"
                        title="Image"
                        icon={cilImage}
                        className="action-icon"
                        onClick={() => { if (!showPollCreator) fileUploadRef.current.click(); }}
                    />

                    <input
                        multiple
                        type="file"
                        accept="image/*"
                        className="d-none"
                        ref={fileUploadRef}
                        onChange={handleImageUpload}
                    />
                </div>
            </form>
        </>
    );

    return (
        <CustomModal bodyJSX={bodyJSX} includeHeader={false} includeFooter={false} displayOverflow={false} bodyClasses={bodyClasses} />
    );
}

export default CommentEditor;
