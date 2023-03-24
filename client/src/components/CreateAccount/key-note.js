import "src/styles/auth.css";

import React, { useState } from "react";

const KeyNote = () => {
    const [noteChecked, setNoteChecked] = useState(false);

    return (
        <div>
            <span>
                <input type="checkbox" defaultChecked={noteChecked} onChange={() => setNoteChecked(!noteChecked)} />

                {/* <label> */}
                    <span style={{ opacity: noteChecked ? 1 : 0.5, marginLeft: "5px" }}>
                        Chirp uses your data to personalize your experience. By signing up, you agree to our terms and 
                        conditions, privacy policy & cookie use.
                    </span>
                {/* </label> */}
            </span>


            <div className="auth-box" id="forgot-box" style={{ marginTop: "70px" }}>
                <span className="d-flex justify-content-center align-items-end auth-text">Next</span>
            </div>
        </div>
    )
}

export default KeyNote;

