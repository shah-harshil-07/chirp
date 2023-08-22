const useImageConverter = () => {
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

    return { getFileObjectFromBase64 };
}

export default useImageConverter;
