import React from "react";
import { useParams } from "react-router-dom";

const CommentList = () => {
    const { postId } = useParams();

    return (
        <>{postId ?? ''}</>
    );
}

export default CommentList;
