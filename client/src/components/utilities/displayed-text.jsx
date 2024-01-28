import React from "react";

const DisplayedText = ({ text }) => {
    return <pre style={{ fontFamily: "sans-serif", fontSize: "20px" }}>{text ?? ''}</pre>;
};

export default DisplayedText;
