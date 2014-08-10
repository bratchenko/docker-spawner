module.exports = {
    findListById: findSpawnListById,
    start: startSpawn,
    cancel: cancelSpawn,
    runWorker: runWorker,
    initSocketIo: initSocketIo
};

var
    mongoose = require('mongoose'),
    kue = require('kue'),
    co = require('co'),
    Q = require('q');

// This will be filled when 'initSocketIo is called'
// and then we'll be able to send updates
var socketIo;

var SpawnLogRecordSchema = mongoose.Schema({
    message: String
});

var SpawnSchema = mongoose.Schema({
    serviceDestinationId: mongoose.Schema.Types.ObjectId,

    startTime: Date,
    endTime: Date,
    success: Boolean,
    error: String,
    log: [SpawnLogRecordSchema],
});

SpawnSchema.methods.addLogRecord = function(message) {
    this.log.push({
        message: message
    });
};

SpawnSchema.pre('save', function(next) {
    this.updatedTime = new Date();
    if (this.isModified('startTime') || this.isModified('endTime')) {
        _sendUpdatedSpawn(this);
    }
    return next();
});

var Spawn = mongoose.connection.model('Spawn', SpawnSchema);

var queue = kue.createQueue({
    prefix: 'docker-spawner',
    redis: {
        port: global.config.redis.port,
        host: global.config.redis.host
    }
});

function startSpawn(serviceDestination) {
    var spawn = new Spawn({
        serviceDestinationId: serviceDestination._id,
        startTime: new Date()
    });
    return spawn.save().then(function(spawn) {
        return _addJobToQueue(spawn)
                .then(function() {
                    return spawn;
                });
    });
}

function cancelSpawn(spawnId) {
    return Spawn.findById(spawnId).exec()
        .then(function(spawn) {
            if (spawn && !spawn.endTime) {
                spawn.endTime = new Date();
                spawn.success = false;
                spawn.error = "Cancelled";

                console.log("Spawn %s cancelled!", spawn._id);

                return spawn.save();
            }
        });
}

function findSpawnListById(ids) {
    return Spawn.find({
        _id: {
            $in: ids
        }
    }).exec();
}


function initSocketIo(io) {
    socketIo = io;
    socketIo.on('connect', function(socket) {
        socket.on('get-spawns', function(fromTime) {
            Spawn.find({
                updatedTime: {
                    $gte: new Date(fromTime)
                }
            }).exec().then(function(spawns) {
                spawns.forEach(function(spawn) {
                    socket.emit('spawn', spawn);
                });
            });
        });
    });
}

function _sendUpdatedSpawn(spawn) {
    if (socketIo) {
        socketIo.emit('spawn', spawn);
    }
}

function runWorker() {
    var serviceDestinations = require('./service-destinations');
    var destinations = require('./destinations');
    var services = require('./services');

    queue.process('spawn', function(job, callback){
        console.log("Got job", job.data);
        Spawn.findById(job.data.spawnId).exec().then(function(spawn) {
            if (!spawn) {
                console.error("Spawn with id " + job.data.spawnId + " not found");
                return callback();
            }

            function done(err) {
                if (err) {
                    spawn.success = false;
                    spawn.error = err.stack ? err.stack : err;
                    console.log("Spawn %s failed!", spawn._id, err);
                } else {
                    spawn.success = true;
                    console.log("Spawn %s completed!", spawn._id);
                }
                spawn.endTime = new Date();
                spawn.save(function() {
                    return callback();
                });
            }

            serviceDestinations.findById(spawn.serviceDestinationId)
                .then(function(serviceDestination) {
                    var destinationPromise = destinations.findById(serviceDestination.destinationId);
                    var servicePromise = services.findById(serviceDestination.serviceId);

                    return Q.all([destinationPromise, servicePromise]).then(function(results) {
                        var destination = results[0];
                        var service = results[1];

                        var DestinationClass = require('./destinations/' + destination.type);
                        var destinationInstance = new DestinationClass(spawn, service, destination, serviceDestination);

                        var thunk = co(destinationInstance.spawn);
                        return Q.nfcall(thunk.bind(destinationInstance));
                    });
                })
                .then(
                    function() {
                        return done();
                    }, function(err) {
                        return done(err);
                    }
                );
        }).then(null, function(err) {
            console.error(err);
        });

    });
}

function _addJobToQueue(spawn) {
    var job = queue.create('spawn', {
        spawnId: spawn._id
    });
    return Q.nfcall(job.save.bind(job)).then(function() {
        return job;
    });
}
