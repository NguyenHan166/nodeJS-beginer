'use strict';

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3052, // Default port if not set in environment variables
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost', // Default host if not set in environment variables
        port: process.env.DEV_DB_PORT || 27017, // Default port if not set in environment variables
        name: process.env.DEV_DB_NAME || 'shopDEV', // Development database name
    },
    
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3305, // Default port if not set in environment variables
    },
    db: {
        host: process.env.PRO_DB_HOST || 'localhost',
        port: process.env.PRO_DB_PORT || 27017,
        name: process.env.PRO_DB_NAME || 'shopPRODUCT', // Development database name
    },
    
}

const config = {dev , pro};
const env = process.env.NODE_ENV || 'dev'; // Default to 'dev' if NODE_ENV is not set


console.log(config[env], env);
module.exports = config[env];