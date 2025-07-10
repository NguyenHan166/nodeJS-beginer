require('dotenv').config(); // Load environment variables from .env file
const compression = require('compression');
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');


// console.log(`Process::` , process.env)

// init middlewares
app.use(morgan('dev')); // logging middleware
// (morgan('tiny')); // logging middleware
// (morgan('combined')); // logging middleware
// (morgan('short')); // logging middleware
// (morgan('common')); // logging middleware

app.use(helmet());
app.use(compression()); // compress response bodies for all requests
app.use(express.json())
app.use(express.urlencoded({
    extended: true // support for URL-encoded bodies
}))

// init db
require('./dbs/init.mongodb.js'); // connect to MongoDB
const {checkOverLoad} = require('./helpers/check.connect.js'); // check number of connections
checkOverLoad(); // check for overload every 5 seconds



// init routes

app.use('/', require('./routes')); // main route

// handle errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

// error handler
app.use((error, req, res, next) => {
    console.error('Error::', error);
    res.status(error.status || 500).json({
        status: 'error',
        code: error.status || 500,
        message: error.message || 'Internal Server Error'
    });
})

module.exports = app;