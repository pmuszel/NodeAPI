const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { stat } = require('fs');

MONGODB_URI =
  'mongodb+srv://devadmin:devadmin@nodeserver.sydem.mongodb.net/messages'; // ?retryWrites=true&w=majority'

const app = express();

// const fileStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, './images');
//   },
//   filename: (req, file, callback) => {
//     const firstPart = new Date().toISOString().replace(/:/g, '-');
//     console.log(firstPart);
//     callback(null, firstPart + '_' + file.originalname);
//   },
// });


const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};


app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
    message: message,
    data: data
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('CONNECTED!');
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
