import React from "react";
import { CircularProgress } from "@material-ui/core";
import { useSelector } from "react-redux";

import Post from "./Post";

const Posts = ({ setCurrentId }) => {
  const posts = useSelector((state) => state.posts);

  return (
    !posts.length ? <CircularProgress /> : (
      <>{ posts.map(post => <Post post={post} setCurrentId={setCurrentId} />) }</>
    )
  );
};

export default Posts;
