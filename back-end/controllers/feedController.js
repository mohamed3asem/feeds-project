const multer = require('multer')
const fs = require('fs')
const path = require('path')

const io = require('../socket')
const Post = require('../models/postModel')
const catchAsync = require('../utilis/catchAsync')
const appError = require('../utilis/appError')

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]
    cb(null, `${file.originalname}-${Date.now()}.${ext}`)
  }
})

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new appError('Not an image please upload only images', 400))
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadPostPhoto = upload.single('image')

exports.getPosts = catchAsync( async (req, res, next) => {
  const page = req.query.page * 1 || 1
  const limit = 2
  const skip = (page - 1) * limit
  const posts = await Post.find().skip(skip).limit(limit).sort({createdAt: -1}).lean()
  const totalItems = await Post.countDocuments()
  res.status(200).json({
    posts,
    totalItems,
    userId: req.user._id
  });
});

exports.createPost = catchAsync( async (req, res) => {
  const post = await Post.create({
  title: req.body.title,
  content: req.body.content,
  image: req.file.filename,
  creator: req.user
})
  io.getIo().emit('posts', { action: 'create', post})
  // Create post in db
  res.status(201).json({
    message: 'Post created successfully!',
    post
  });
});

exports.getPost = catchAsync( async(req, res, next) => {
  const post = await Post.findById(req.params.id).lean()
  // throw error
  if(!post) next(new appError('No post found with that ID', 404))
  res.status(200).json({
    status: 'success',
    message: 'Post found successfully!',
    post
  });
})

const deleteImage = (filename) => {
  filePath = path.join(__dirname, `../public/images/${filename}`)
  fs.unlink(filePath, err => {
    new appError(err, 500)
  })
}

exports.updatePost = catchAsync( async(req, res, next) => {
  
  let post
  if (req.file) {
    post = await Post.findById(req.params.id)
    if(!post) next(new appError('No post found with that ID', 404))

    if(!post.creator._id.equals(req.user._id)) {
      return next(new appError('you do not have permission to perform this action', 403))
    }

    deleteImage(post.image)

    post.title = req.body.title
    post.content = req.body.content
    post.image= req.file.filename
    post.creator= {name: 'Mohamed Asem'}
    
     const post = await post.save()
     io.getIo().emit('posts', { action: 'update', post})
  } else {
    const updatedPost = {
      title: req.body.title,
      content: req.body.content
    }

    post = await Post.findOneAndUpdate({
    _id: req.params.id,
    "creator._id": req.user._id
    },
     updatedPost,
     {
      new: true,
      runValidators: true
    }) 
    
    if(!post) {
      return next(new appError('you do not have permission to perform this action', 403))
    }

    io.getIo().emit('posts', { action: 'update', post})

  }
  res.status(200).json({
    message: 'Post updated successfully!',
    post
  });
})

exports.deletePost = catchAsync( async (req, res, next) => {
  const post = await Post.findById(req.params.id)
  if(!post) next(new appError('No post found with that ID', 404))

  if(!post.creator._id.equals(req.user._id)) {
    return next(new appError('you do not have permission to perform this action', 403))
  }

  deleteImage(post.image)
  io.getIo().emit('posts', { action: 'delete', post})
  
  await post.remove()
  res.status(200).json({
    message: 'Post deleted successfully!'
  });
})