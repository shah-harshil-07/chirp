import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef } from "react";

const EmojiContainer = ({ handleEmojiSelect, handleClickOutside }) => {
    const containerRef = useRef(null);

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
