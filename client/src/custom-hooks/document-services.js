import { useDispatch, useSelector } from "react-redux";
import { setDocumentEventListeners } from "src/redux/actions/documents";

const useDocumentClickServices = () => {
    const dispatch = useDispatch();
    const callbacks = useSelector(state => state.documents);

    const handleDocumentClick = e => {
        callbacks.forEach(callback => { callback(e); });
    }

    const addDocumentClickCallback = (key, callback) => {
        callbacks.set(key, callback);
        dispatch(setDocumentEventListeners("DOCUMENT", callbacks));
    }

    document.addEventListener("click", handleDocumentClick);
    return { addDocumentClickCallback };
}

export default useDocumentClickServices;
