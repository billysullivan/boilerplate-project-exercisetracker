const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
//Solution
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI);


const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String, required: true, default: shortid.generate },
  username: { type: String, required: true },
});

const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', (req, res) => {
  const user = new User({ username: req.body.username });
  user.save((err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const exercise = new Exercise({
    userId: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date) : undefined,
  });
  exercise.save((err, data) => {
    if (err) return console.log(err);
    User.findById(data.userId, (err, user) => {
      if (err) return console.log(err);
      res.json({
        _id: user._id,
        username: user.username,
        date: new Date(data.date).toDateString(),
        duration: data.duration,
        description: data.description,
      });
    });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id, (err, user) => {
    if (err) return console.log(err);
    Exercise.find({ userId: req.params._id }, (err, exercises) => {
      if (err) return console.log(err);
      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises.map(e => ({
          description: e.description,
          duration: e.duration,
          date: new Date(e.date).toDateString(),
        })),
      });
    });
  });
});
