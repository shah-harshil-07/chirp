import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDocumentEventListeners } from "src/redux/reducers/documents";

const useDocumentClickServices = () => {
    const dispatch = useDispatch(), callbackState = useSelector(state => state.documents);

    useEffect(() => {
        const { callbackMap } = callbackState;

        const handleDocumentClick = e => {
            if (callbackMap) callbackMap.forEach(callback => { callback(e); });
        };

        document.addEventListener("click", handleDocumentClick);
        return () => { document.removeEventListener("click", handleDocumentClick); };
    }, [callbackState]);

    const addDocumentClickCallback = (key, callback) => {
        const newCallbackMap = new Map(callbackState.callbackMap);
        newCallbackMap.set(key, callback);
        dispatch(setDocumentEventListeners({ callbackMap: newCallbackMap }));
    };

    return { addDocumentClickCallback };
};

export default useDocumentClickServices;
