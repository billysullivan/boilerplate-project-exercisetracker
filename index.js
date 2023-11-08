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

app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  try {
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const exercise = new Exercise({
    userId: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date) : undefined,
  });

  try {
    await exercise.save();

    const user = await User.findById(exercise.userId);
    res.json({
      _id: user._id,
      username: user.username,
      date: new Date(exercise.date).toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    let exercises = await Exercise.find({ userId: req.params._id });

    // Filter exercises based on the 'from' and 'to' query parameters
    if (req.query.from || req.query.to) {
      let fromDate = req.query.from ? new Date(req.query.from) : new Date(0);
      let toDate = req.query.to ? new Date(req.query.to) : new Date();

      exercises = exercises.filter(exercise => {
        let exerciseDate = new Date(exercise.date);
        return exerciseDate >= fromDate && exerciseDate <= toDate;
      });
    }

    // Limit the number of exercises based on the 'limit' query parameter
    if (req.query.limit) {
      exercises = exercises.slice(0, req.query.limit);
    }

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
  } catch (err) {
    console.error(err);
  }
});


