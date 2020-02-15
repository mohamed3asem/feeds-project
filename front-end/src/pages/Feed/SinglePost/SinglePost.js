import React, { Component } from 'react';
import axios from 'axios'

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  async componentDidMount() {
    try{
      const postId = this.props.match.params.postId;
      const res = await axios({
        url: `http://localhost:8080/feed/post/${postId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.props.token}`
        }
      })
      
      if (res.status !== 200) {
        throw new Error('Failed to fetch status');
      }
      this.setState({
        title: res.data.post.title,
        author: res.data.post.creator.name,
        image: `http://localhost:8080/images/${res.data.post.image}`,
        date: new Date(res.data.post.createdAt).toLocaleDateString('en-US'),
        content: res.data.post.content
      });
    } catch (err) {
      console.log(err)
    }
    // fetch('URL')

    //   .then(res => {
    //     if (res.status !== 200) {
    //       throw new Error('Failed to fetch status');
    //     }
    //     return res.json();
    //   })
    //   .then(resData => {
    //     this.setState({
    //       title: resData.post.title,
    //       author: resData.post.creator.name,
    //       date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
    //       content: resData.post.content
    //     });
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain image={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
