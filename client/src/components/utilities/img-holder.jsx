import "src/styles/utilities/img-holder.css";

import React from "react";

const ImgHolder = ({ images, removeImage, showActionButtons = true }) => {
    const removeImageIcon = (index = 0, right = "20px", top = "5px") => {
        return (
            <div className="img-holder-remove-img-icon" onClick={() => removeImage(index)} style={{ right, top }}>
                <span style={{ fontSize: "20px" }}>&times;</span>
            </div>
        );
    }

    const editButton = (bottom = "6px", left = "21px") => {
        return <div className="img-holder-edit-btn" style={{ bottom, left }}>Edit</div>;
    }

    return (
        <div className="img-holder-body">
            {
                images.length === 1 ? (
                    <div className="w-100 h-100 position-relative">
                        {showActionButtons && removeImageIcon(0, "10px")}

                        <img
                            alt="uploaded"
                            src={images[0]}
                            className="object-fit-cover w-100 h-100 rounded-10 max-height-400"
                        />

                        {showActionButtons && editButton("6px", "10px")}
                    </div>
                ) : images.length === 2 ? (
                    <>
                        <div className="w-50 pr-1 position-relative">
                            {showActionButtons && removeImageIcon(0, "10px")}

                            <img
                                src={images[0]}
                                alt="uploaded"
                                className="object-fit-cover w-100 h-100 rounded-10 max-height-400"
                            />

                            {showActionButtons && editButton("6px", "10px")}
                        </div>

                        <div className="w-50 pl-1 position-relative">
                            {showActionButtons && removeImageIcon(1, "10px")}

                            <img
                                src={images[1]}
                                alt="uploaded"
                                className="object-fit-cover w-100 h-100 rounded-10 max-height-400"
                            />

                            {showActionButtons && editButton("6px", "10px")}
                        </div>
                    </>
                ) : images.length === 3 ? (
                    <>
                        <div className="w-50 pr-1 position-relative">
                            {showActionButtons && removeImageIcon(0, "10px")}

                            <img
                                alt="uploaded"
                                src={images[0]}
                                className="object-fit-cover w-100 h-100 rounded-10 position-relative max-height-400"
                            />

                            {showActionButtons && editButton("10px", "10px")}
                        </div>

                        <div className="w-50 pl-1 d-flex flex-column">
                            <div className="h-50 pb-1 position-relative">
                                {showActionButtons && removeImageIcon(1, "6px", "8px")}

                                <img
                                    src={images[1]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("13px", "12px")}
                            </div>

                            <div className="h-50 pt-1 position-relative">
                                {showActionButtons && removeImageIcon(2, "6px", "13px")}

                                <img
                                    src={images[2]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("6px", "12px")}
                            </div>
                        </div>
                    </>
                ) : images.length >= 4 ? (
                    <div className="d-flex flex-column">
                        <div className="d-flex pb-1 h-50">
                            <div className="w-50 pr-1 position-relative">
                                {showActionButtons && removeImageIcon(0, "10px")}

                                <img
                                    src={images[0]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("6px", "10px")}
                            </div>

                            <div className="w-50 pl-1 position-relative">
                                {showActionButtons && removeImageIcon(1, "10px")}

                                <img
                                    src={images[1]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("6px", "10px")}
                            </div>
                        </div>

                        <div className="d-flex pt-1 h-50">
                            <div className="w-50 pr-1 position-relative">
                                {showActionButtons && removeImageIcon(2, "10px")}

                                <img
                                    src={images[2]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("6px", "10px")}
                            </div>

                            <div className="w-50 pl-1 position-relative">
                                {showActionButtons && removeImageIcon(3, "10px")}

                                <img
                                    src={images[3]}
                                    alt="uploaded"
                                    className="object-fit-cover w-100 h-100 rounded-10 max-height-200"
                                />

                                {showActionButtons && editButton("6px", "10px")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <></>
                )
            }
        </div>
    )
}

export default ImgHolder;
