export const openModal = () => async dispatch => {
    dispatch({ type: "MODAL", payload: true });
}

export const closeModal = () => async dispatch => {
    dispatch({ type: "MODAL", payload: false });
}