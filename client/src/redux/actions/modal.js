export const openModal = type => async dispatch => {
    dispatch({ type: "MODAL", payload: { type, open: true } });
}

export const closeModal = () => async dispatch => {
    dispatch({ type: "MODAL", payload: { type: '', open: false } });
}