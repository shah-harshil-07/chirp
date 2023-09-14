import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import { checkContainerInViewport } from "src/utilities/helpers";
import useDocumentClickServices from "src/custom-hooks/document-services";

const EmojiContainer = ({ callbackKey, handleEmojiSelect, handleClickOutside }) => {
    const containerRef = useRef(null);
    const { addDocumentClickCallback } = useDocumentClickServices();

    useLayoutEffect(() => {
        const containerRect = containerRef?.current?.getBoundingClientRect() ?? null;
        if (containerRect) {
            const isContainerInViewport = checkContainerInViewport(containerRect);
            if (!isContainerInViewport) containerRef.current.style.bottom = "87px";
        }

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const outsideClickFn = e => {
            if (containerRef?.current && !containerRef.current.contains(e.target)) {
                handleClickOutside();
            }
        };

        addDocumentClickCallback(callbackKey, outsideClickFn);
        // eslint-disable-next-line
    }, [handleClickOutside]);

    return (
        <div className="position-absolute" ref={containerRef} style={{ zIndex: '2' }}>
            <EmojiPicker lazyLoadEmojis={true} onEmojiClick={handleEmojiSelect} />
        </div>
    );
}

export default EmojiContainer;
