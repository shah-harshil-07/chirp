import React from "react";
import { useSelector } from "react-redux";

import Post from "./Post";

const Posts = ({ setCurrentId }) => {
	const posts = useSelector(state => state.posts);

	return (
		<div style={{ marginBottom: "1000px" }}>
			{
				posts.map((post, index) => {
					return (<Post key={index} post={post} setCurrentId={setCurrentId} />)
				})
			}
		</div>
	);
};

export default Posts;
