import "src/styles/auth.css";

import React, { useEffect, useState } from "react";

const KeyNote = ({ handleDataChange }) => {
    const [noteChecked, setNoteChecked] = useState(false);

    useEffect(() => {
        handleDataChange(noteChecked);
    }, [noteChecked]);

    return (
        <div id="animated-body">
            <h4><b>Customise your experience</b></h4>

            <span>
                <input type="checkbox" defaultChecked={noteChecked} onChange={() => setNoteChecked(!noteChecked)} />

                <span style={{ opacity: noteChecked ? 1 : 0.5, marginLeft: "5px" }}>
                    Chirp uses your data to personalize your experience. By signing up, you agree to our terms and
                    conditions, privacy policy & cookie use.
                </span>
            </span>
        </div>
    )
}

export default KeyNote;

