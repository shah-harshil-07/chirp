import React from "react";

const ImgHolder = ({ images }) => {
    const removeImageIcon = (right = "20px", top = "5px") => {
        return (
            <div style={{ width: "30px", height: "30px", color: "whitesmoke", backgroundColor: "black", paddingLeft: "9px", borderRadius: "20px", position: "absolute", zIndex: '1', right, top }}>
                <span style={{ fontSize: "20px" }}>&times;</span>
            </div>
        )
    };

    const editButton = (bottom = "6px", left = "21px") => {
        return (
            <div style={{ paddingLeft: "15px", height: "34px", width: "60px", paddingTop: "5px", backgroundColor: "black", color: "whitesmoke", paddingBottom: "5px", borderRadius: "20px", cursor: "pointer", position: "absolute", bottom, left }}>
                Edit
            </div>
        )
    }

    return (
        <div className="row mb-3">
            {
                images.length === 1 ? (
                    <div className="col-md-12 position-relative">
                        {removeImageIcon()}
                        <img src={images[0]} alt="uploaded" className="w-100 rounded-10" />
                        {editButton()}
                    </div>
                ) : images.length === 2 ? (
                    <>
                        <div className="col-md-6 position-relative">
                            {removeImageIcon()}
                            <img src={images[0]} alt="uploaded" className="w-100 rounded-10" />
                            {editButton()}
                        </div>

                        <div className="col-md-6 position-relative">
                            {removeImageIcon()}
                            <img src={images[1]} alt="uploaded" className="w-100 rounded-10" />
                            {editButton()}
                        </div>
                    </>
                ) : images.length === 3 ? (
                    <>
                        <div className="col-lg-6 position-relative">
                            {removeImageIcon()}
                            <img
                                alt="uploaded"
                                src={images[0]}
                                style={{ objectFit: "cover" }}
                                className="w-100 h-100 rounded-10 position-relative"
                            />
                            {editButton("10px", "23px")}
                        </div>

                        <div className="col-lg-6">
                            <div className="row pb-2 position-relative">
                                {removeImageIcon("6px", "8px")}
                                <img src={images[1]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton("13px", "12px")}
                            </div>

                            <div className="row pt-2 position-relative">
                                {removeImageIcon("6px", "13px")}
                                <img src={images[2]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton("6px", "12px")}
                            </div>
                        </div>
                    </>
                ) : images.length >= 4 ? (
                    <>
                        <div className="row pb-2">
                            <div className="col-md-6 position-relative">
                                {removeImageIcon()}
                                <img src={images[0]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton()}
                            </div>

                            <div className="col-md-6 position-relative">
                                {removeImageIcon()}
                                <img src={images[1]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton()}
                            </div>
                        </div>

                        <div className="row pt-2">
                            <div className="col-md-6 position-relative">
                                {removeImageIcon()}
                                <img src={images[2]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton()}
                            </div>

                            <div className="col-md-6 position-relative">
                                {removeImageIcon()}
                                <img src={images[3]} alt="uploaded" className="w-100 h-100 rounded-10" />
                                {editButton()}
                            </div>
                        </div>
                    </>
                ) : (
                    <></>
                )
            }
        </div>
    )
}

export default ImgHolder;
