import { useDispatch } from "react-redux";

import { openToaster } from "src/redux/reducers/toaster";

const useToaster = () => {
    const dispatch = useDispatch();

    const showSuccess = message => {
        dispatch(openToaster({ messageObj: { message, type: "Success" } }));
    }

    const showError = message => {
        dispatch(openToaster({ messageObj: { message, type: "Error" } }));
    }

    return { showSuccess, showError };
}

export default useToaster;
