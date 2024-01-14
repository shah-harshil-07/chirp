import useToaster from "./toaster-message";

const useImageConverter = () => {
    const { showError } = useToaster();
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

    const getFileObjectFromBase64 = (base64ImgData, fileName) => {
        const ext = fileName?.split('.')?.[1] ?? "jpg", sliceSize = 512, contentType = `image/${ext}`;
        let byteChars = window.atob(base64ImgData), byteArrays = [];

        for (let i = 0; i < byteChars.length; i += sliceSize) {
            let slice = byteChars.slice(i, i + sliceSize), byteNumbers = Array(slice.length);
            for (let j = 0; j < slice.length; j++) byteNumbers[j] = slice.charCodeAt(j);
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        let blob = new Blob(byteArrays, { type: contentType });
        return new File([blob], fileName, { type: contentType });
    }

    const uploadImagesAction = (e, onloadCallback, uploadedFiles, uploadLimit = 4) => {
        const files = e.target.files;

        if (files.length + uploadedFiles.length > uploadLimit) {
			showError(`More than ${uploadLimit} image${uploadLimit > 1 ? "s are" : " is"} not allowed.`);
		} else {
			for (const fileObj of files) {
				if (!allowedFileTypes.includes(fileObj.type)) {
					showError("Only jpg, jpeg & png type files are allowed.");
					continue;
				}

				if (fileObj.size > (1024 * 1024 * 5)) {
					showError("Uploaded file's size must not exceed 5MB.");
					continue;
				}

				const reader = new FileReader();
				reader.onload = e => { onloadCallback(e, fileObj); }
				reader.readAsDataURL(fileObj);
			}
		}
    }

    return { getFileObjectFromBase64, uploadImagesAction };
}

export default useImageConverter;
