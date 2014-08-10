var
    config = global.config = require('./config'),
    express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    expressPromise = require('express-promise'),
    compression = require('compression'),
    auth = require('./server/auth'),
    socketIo = require('socket.io'),
    fs = require('fs');

var app = module.exports = express();

app.set('view engine', 'ejs');

app.use('/scripts', compression());
app.use('/styles', compression());

app.use(bodyParser.json());
app.use(expressPromise());

if (config.environment === 'development') {
    app.use(express.static(__dirname + '/client'));
    app.use(express.static(__dirname + '/.tmp'));
    app.set('views', __dirname + '/client');
} else if (config.environment === 'production') {
    app.use(express.static(__dirname + '/client-build'));
    app.set('views', __dirname + '/client-build');
} else {
    throw new Error("Unknown config.environment: " + config.environment);
}

auth.addAuthToExpressApp(app);

function loadRoutes(path) {
    var files = fs.readdirSync(path);
    files.forEach(function(file) {
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
            loadRoutes(curPath);
        } else {
            if (curPath.match(/\.js/)) {
                require(curPath)(app);
            }
        }
    });
}
loadRoutes(__dirname + "/routes");

app.all('*', function(req, res, next) {
    var err = new Error("Not found: " + req.url);
    err.status = 404;
    return next(err);
});

app.use(function(err, req, res, next) {
    if (err) {
        console.log(err.stack || err);

        res.status(err.status || 500);
        res.json({error: err.message});
    } else {
        next();
    }
});

mongoose.connect(config.mongoUri);

var server = require('http').createServer(app);

app.socketIo = socketIo(server);
auth.addAuthToSocketIo(app.socketIo);

require('./server/spawns').initSocketIo(app.socketIo);
require('./server/spawns').runWorker();

server.listen(config.port, function(err) {
    if (err) console.log(err);

    console.log("Listening at localhost:" + config.port);
});
