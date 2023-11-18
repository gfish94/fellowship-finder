//CHILD OF POSTLIST
import React, { useState, useEffect, useContext } from 'react';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';

function Post({
  message, user, upVotes, created, deletePost, id, editPost, inc, dec
}) {
  const [formInput, setFormInput] = useState('');
  const [huzzah, setHuzzah] = useState(upVotes);
  //console.log('post props', id)

  // const inc = () => {

  // };

  return (
    <div className="post">
      <h4 className="post-message">{message}</h4>
      <h5 className="post-user">{user}</h5>
      <div className="post-created">{created}</div>
      <div className="edit-post" onClick={() => editPost(id, formInput)}>Edit</div>
      <input
        type="text"
        value={formInput}
        onChange={(e) => setFormInput(e.target.value)}
      />
      <div className="delete-button" onClick={() => deletePost(id)}>Delete</div>
      <div className="huzzah-container">
        <NorthIcon onClick={() => {
          setHuzzah(huzzah + 1);
          setFormInput(upVotes);
          inc(id, huzzah);
          console.log('formInput', upVotes);
        }}
        />
        <div className="post-upvotes">Huzzahs: {huzzah}</div>
        <SouthIcon onClick={() => {
          setHuzzah(huzzah - 1);
          setFormInput(upVotes);
          dec(id, huzzah);
          console.log('formInput', upVotes);
        }}
        />
      </div>
    </div>
  );
}

export default Post;
