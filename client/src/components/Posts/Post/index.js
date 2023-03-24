
import React from "react";
import { Card } from "@material-ui/core/";
import CIcon from "@coreui/icons-react";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";
import moment from "moment";
import { useDispatch } from "react-redux";

import "src/styles/post.css";
import { likePost } from "../../../actions/posts";

const Post = ({ post, setCurrentId }) => {
  const dispatch = useDispatch();
  const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

  return (
    <Card id="card">
      <img src={placeHolderImageSrc} id="user-image" />
      <div id="card-body">
        <div className="row mx-0">
          <b>{post.creator}</b>
          <span><div id="seperator-container"><div id="seperator" /></div></span>
          <span>{`${moment(post.createdAt).hours()}h`}</span>
        </div>

        <div className="row mx-0"><div>{post.message}</div></div>

        <div id="action-bar">
          <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
          <CIcon title="Rechirp" icon={cilSend} className="chirp-action" />
          <CIcon title="Like" icon={cilThumbUp} className="chirp-action" />
          <CIcon title="Views" icon={cilChart} className="chirp-action" />
          <CIcon title="Bookmark" icon={cilBookmark} className="chirp-action" />
        </div>
      </div>
    </Card>
  );
};

export default Post;
