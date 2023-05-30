import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import * as Helpers from "src/helpers";

const EmojiContainer = ({ handleEmojiSelect, handleClickOutside, actionContainerRect }) => {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const containerRect = containerRef?.current?.getBoundingClientRect() ?? null;
        if (containerRect) {
            const bottom = actionContainerRect?.bottom ? `${actionContainerRect.bottom - 613}px` : "87px";
            const isContainerInViewport = Helpers.checkContainerInViewport(containerRect);
            if (!isContainerInViewport) containerRef.current.style.bottom = bottom;
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const outsideClickFn = e => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                handleClickOutside();
            }
        };

        document.addEventListener("click", outsideClickFn);

        return () => {
            document.removeEventListener("click", outsideClickFn);
        };
    }, [handleClickOutside]);

    return (
        <div className="position-absolute" ref={containerRef} style={{ zIndex: '2' }}>
            <EmojiPicker lazyLoadEmojis={true} onEmojiClick={handleEmojiSelect} />
        </div>
    )
}

export default EmojiContainer;
