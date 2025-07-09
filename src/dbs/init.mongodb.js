'use strict';

const mongoose =  require('mongoose'); 
const {db : {host, port, name}} = require('../configs/config.mongodb.js'); // import db config
const connectString = `mongodb://${host}:${port}/${name}`; 
const {countConnect} = require('../helpers/check.connect.js'); // check number of connections

class Database {

    constructor() {
        this.connect()
    }

    connect(type = 'mongodb') {
        
        if (1 === 1){
            mongoose.set('debug', true); // enable debug mode
            mongoose.set('debug', {color: true}); // disable strict query mode
        }


        mongoose.connect(connectString).then( _ => {
            console.log('MongoDB connected successfully' , countConnect())
            console.log(`MongoDB connection string: ${connectString}`);
        })
        .catch(err => console.log(`Error connecting to MongoDB: ${err.message}`));

    }

    static getInstance(){

        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;

    }

}


const instanceMongoDb = Database.getInstance();
module.exports = instanceMongoDb;