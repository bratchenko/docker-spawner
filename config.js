var config = {
    environment: process.env.ENVIRONMENT || "production",

    port: process.env.PORT || 5000,

    sessionSecret: process.env.SESSION_SECRET || 'replace-with-your-secret',

    mongoUri: process.env.MONGO_URI || '127.0.0.1/docker-spawner',

    livereload: {
        host: process.env.LIVERELOAD_HOST || 'localhost',
        port: process.env.LIVERELOAD_PORT || '35729',
        enabled: process.env.ENVIRONMENT === "development"
    },

    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379
    }

};

// Local machine config
if( require('fs').existsSync( __dirname + "/config.local.js" ) ) {
    require('lodash').extend(config, require(__dirname + "/config.local.js") );
}

module.exports = config;
