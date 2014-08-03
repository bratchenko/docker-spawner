module.exports = {
    add: addJob,
    start: startProcessing
};

var kue = require('kue'),
    co = require('co'),
    Q = require('q');

var queue = kue.createQueue({
    prefix: 'docker-spawner',
    redis: {
        port: global.config.redis.port,
        host: global.config.redis.host
    }
});

function addJob(serviceDestination) {
    var job = queue.create('spawn', {
        serviceDestinationId: serviceDestination._id
    });
    return Q.nfcall(job.save.bind(job)).then(function() {
        return job;
    });
}

function startProcessing() {
    var serviceDestinations = require('./service-destinations');
    var destinations = require('./destinations');
    var services = require('./services');

    queue.process('spawn', function(job, done){
        serviceDestinations.findById(job.data.serviceDestinationId)
            .then(function(serviceDestination) {
                var destinationPromise = destinations.findById(serviceDestination.destinationId);
                var servicePromise = services.findById(serviceDestination.serviceId);

                return Q.all([destinationPromise, servicePromise]).then(function(results) {
                    var destination = results[0];
                    var service = results[1];

                    var DestinationClass = require('./destinations/' + destination.type);
                    var destinationInstance = new DestinationClass(job, service, destination, serviceDestination);

                    var thunk = co(destinationInstance.spawn);
                    return Q.nfcall(thunk.bind(destinationInstance));
                });
            })
            .then(
                function() {
                    console.log("Job done!");
                    return done();
                }, function(err) {
                    console.error("Job error", err);
                    return done(err);
                }
            );

    });
}
