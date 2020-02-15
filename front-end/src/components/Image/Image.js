import React from 'react';

import './Image.css';

const image = props => (
  <div
    className="image"
    style={{
      backgroundImage: `url('${props.image}')`,
      backgroundSize: props.contain ? 'contain' : 'cover',
      backgroundPosition: props.left ? 'left' : 'center'
    }}
  />
);

export default image;
