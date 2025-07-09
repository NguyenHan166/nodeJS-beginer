'use strict';

const mongoose =  require('mongoose'); 

const connectString = 'mongodb://localhost:27017/shopDEV'; 

mongoose.connect(connectString).then( _ => console.log('MongoDB connected successfully'))
.catch(err => console.log(`Error connecting to MongoDB: ${err.message}`));  

if (1 === 1){
    mongoose.set('debug', true); // enable debug mode
    mongoose.set('debug', {color: true}); // disable strict query mode
}