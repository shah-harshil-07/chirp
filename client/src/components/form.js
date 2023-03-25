import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CIcon from "@coreui/icons-react";
import { cilImage, cilSmile, cilList } from "@coreui/icons";

import "src/styles/form.css";
import { createPost, updatePost } from "../actions/posts";

const Form = ({ currentId, setCurrentId }) => {
  const [postData, setPostData] = useState({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
  const post = useSelector((state) => (currentId ? state.posts.find((message) => message._id === currentId) : null));
  const dispatch = useDispatch();
  const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

  useEffect(() => {
    if (post) setPostData(post);
  }, [post]);

  const clear = () => {
    setCurrentId(0);
    setPostData({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentId === 0) {
      dispatch(createPost(postData));
      clear();
    } else {
      dispatch(updatePost(currentId, postData));
      clear();
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <img src={placeHolderImageSrc} className="user-image" alt="user" />

      <div className="input-box">
        <textarea id="special-input" placeholder="What's happening?" />
        <hr />
        <CIcon className="action-icon" title="Image" icon={cilImage} size="sm"/>
        <CIcon className="action-icon" title="Emoji" icon={cilSmile} size="sm"/>
        <CIcon className="action-icon" title="Poll" icon={cilList} size="sm"/>

        <div id="chirp-button">Chirp</div>
      </div>
    </form>
  );
};

export default Form;
