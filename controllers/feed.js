const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.countDocuments()
  .then(count => {
    totalItems = count;

    return Post.find()
    .skip((currentPage - 1) * perPage)
    .limit(perPage)   
  })
  .then((posts) => {
    res.status(200).json({ message: 'Fetched posts', posts: posts, totalItems: totalItems });
  })
  .catch(err => catchCode(err, next));

  
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);

  console.log(req.body);
  console.log(req.file);

  if (!errors.isEmpty()) {
    const error = new Error('Validation error, data is incorrect!');
    error.statusCode = 422;
    throw error;
  }
  if(!req.file) {
    const error = new Error('No image!');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\" ,"/");
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: 'Piotr' },
  });

  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
      });
    })
    .catch(err => catchCode(err, next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: 'Post fetched', post: post });
    })
    .catch(err => catchCode(err, next));
};

const catchCode = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};


exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation error, data is incorrect!');
        error.statusCode = 422;
        throw error;
    }

    let imageUrl = req.body.image;
    const title = req.body.title;
    const content = req.body.content;

    if(req.file) {
        imageUrl = req.file.path.replace("\\" ,"/");
    }

    if(!imageUrl) {
        const error = new Error('No file picked!');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        if(imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;

        return post.save();
    })
    .then(result => {
        res.status(200).json({message: 'Post updated!', post: result})
    })
    .catch(err => catchCode(err, next));

};


exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
  .then(post => {
    if(!post) {
      const error = new Error('Could not find post');
      error.statusCode = 404;
      throw error;
    }

    clearImage(post.imageUrl);

    return Post.findByIdAndRemove(postId);
  })
  .then(result => res.status(200).json({message: 'Post deleted!'}))
  .catch(err => catchCode(err, next));
}


const clearImage = filePath => {
    const file = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};