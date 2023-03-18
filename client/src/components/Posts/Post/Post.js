import React from 'react';
import { Card, Button } from '@material-ui/core/';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { likePost } from '../../../actions/posts';
import useStyles from './styles';

const Post = ({ post, setCurrentId }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

  return (
    <Card style={{ borderBottom: "2px solid #80808057", borderRadius: '0' }}>
      <img src={placeHolderImageSrc} style={{ width: "", borderRadius: "50%" }} />
      <div style={{ marginLeft: "60px" }}>
        <div className="row">
          <b>{post.creator}</b>
          <span>
            <div style={{ width: "24px", height: "24px", padding: "8px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "grey" }} />
            </div>
          </span>
          <span>{`${moment(post.createdAt).hours()}h`}</span>
        </div>

        <div className="row"><div>{post.message}</div></div>

        <div className="row">
          <div className="d-flex" onClick={() => dispatch(likePost(post._id))}>
            <span><ThumbUpAltIcon fontSize="small" /></span> &nbsp;{post.likeCount}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Post;
