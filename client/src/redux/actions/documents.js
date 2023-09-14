export const setDocumentEventListeners = (type, props) => async dispatch => {
    dispatch({ type, payload: props });
}