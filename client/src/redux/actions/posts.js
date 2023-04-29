import { FETCH_ALL, CREATE, UPDATE, DELETE, LIKE } from '../constants/actionTypes';
import API from "../../api/index.js";
import * as Constants from "src/constants";

export const getPosts = () => async dispatch => {
	try {
		const { data } = await API(Constants.GET, Constants.GET_POSTS);
		dispatch({ type: FETCH_ALL, payload: data });
	} catch (error) {
		console.log(error.message);
	}
};

export const createPost = (post) => async (dispatch) => {
	try {
		const data = [];
		dispatch({ type: CREATE, payload: data });
	} catch (error) {
		console.log(error.message);
	}
};

export const updatePost = (id, post) => async (dispatch) => {
	try {
		const data = [];
		dispatch({ type: UPDATE, payload: data });
	} catch (error) {
		console.log(error.message);
	}
};

export const likePost = (id) => async (dispatch) => {
	try {
		const data = [];
		dispatch({ type: LIKE, payload: data });
	} catch (error) {
		console.log(error.message);
	}
};

export const deletePost = (id) => async (dispatch) => {
	try {
		// await api.deletePost(id);

		dispatch({ type: DELETE, payload: id });
	} catch (error) {
		console.log(error.message);
	}
};
