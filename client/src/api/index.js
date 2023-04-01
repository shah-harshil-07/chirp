import axios from 'axios';

const url = 'http://localhost:5000/posts';
const fetchUrl = "http://localhost:5000/posts/all";

export const fetchPosts = () => axios.get(fetchUrl);
export const createPost = (newPost) => axios.post(url, newPost);
export const likePost = (id) => axios.patch(`${url}/${id}/likePost`);
export const updatePost = (id, updatedPost) => axios.patch(`${url}/${id}`, updatedPost);
export const deletePost = (id) => axios.delete(`${url}/${id}`);
