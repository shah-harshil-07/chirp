import "src/styles/form/img-holder.css";

import React from "react";

const ImgHolder = ({ images, removeImage, showActionButtons = true }) => {
    const removeImageIcon = (index = 0, right = "20px", top = "5px") => {
        return (
            <div className="img-holder-remove-img-icon" onClick={() => removeImage(index)} style={{ right, top }}>
                <span style={{ fontSize: "20px" }}>&times;</span>
            </div>
        )
    }

    const editButton = (bottom = "6px", left = "21px") => {
        return (
            <div className="img-holder-edit-btn" style={{ bottom, left }}>Edit</div>
        )
    }

    return (
        <div className="d-flex h-100">
            {
                images.length === 1 ? (
                    <div className="w-100 h-100 position-relative">
                        {showActionButtons && removeImageIcon()}
                        <img src={images[0]} alt="uploaded" className="object-fit-cover w-100 rounded-10" />
                        {showActionButtons && editButton()}
                    </div>
                ) : images.length === 2 ? (
                    <>
                        <div className="w-50 pr-1 position-relative">
                            {showActionButtons && removeImageIcon(0)}
                            <img src={images[0]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                            {showActionButtons && editButton()}
                        </div>

                        <div className="w-50 pl-1 position-relative">
                            {showActionButtons && removeImageIcon(1)}
                            <img src={images[1]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                            {showActionButtons && editButton()}
                        </div>
                    </>
                ) : images.length === 3 ? (
                    <>
                        <div className="w-50 pr-1 position-relative">
                            {showActionButtons && removeImageIcon(0)}
                            <img
                                alt="uploaded"
                                src={images[0]}
                                className="object-fit-cover w-100 h-100 rounded-10 position-relative"
                            />
                            {showActionButtons && editButton("10px", "23px")}
                        </div>

                        <div className="w-50 pl-1 d-flex flex-column">
                            <div className="h-50 pb-1 position-relative">
                                {showActionButtons && removeImageIcon(1, "6px", "8px")}
                                <img src={images[1]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton("13px", "12px")}
                            </div>

                            <div className="h-50 pt-1 position-relative">
                                {showActionButtons && removeImageIcon(2, "6px", "13px")}
                                <img src={images[2]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton("6px", "12px")}
                            </div>
                        </div>
                    </>
                ) : images.length >= 4 ? (
                    <div className="d-flex flex-column">
                        <div className="d-flex pb-1 h-50">
                            <div className="w-50 pr-1 position-relative">
                                {showActionButtons && removeImageIcon(0)}
                                <img src={images[0]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton()}
                            </div>

                            <div className="w-50 pl-1 position-relative">
                                {showActionButtons && removeImageIcon(1)}
                                <img src={images[1]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton()}
                            </div>
                        </div>

                        <div className="d-flex pt-1 h-50">
                            <div className="w-50 pr-1 position-relative">
                                {showActionButtons && removeImageIcon(2)}
                                <img src={images[2]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton()}
                            </div>

                            <div className="w-50 pl-1 position-relative">
                                {showActionButtons && removeImageIcon(3)}
                                <img src={images[3]} alt="uploaded" className="object-fit-cover w-100 h-100 rounded-10" />
                                {showActionButtons && editButton()}
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
