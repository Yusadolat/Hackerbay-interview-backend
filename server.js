require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const logger = require('morgan');

const user = require('./routes/user')

const app = express();
const port = process.env.PORT || 8081;

app.use(bodyParser.json());
if (process.env.NODE_ENV !== 'test') app.use(logger('tiny'));

// Connect to available DB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Initialize passport
app.use(passport.initialize());

require('./config')(passport);

// user route
app.use('/user', user)

app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;