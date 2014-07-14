deployJobs = JobCollection('deployJobs');

if (Meteor.isServer) {

  	deployJobs.allow({
	    admin: function () {
	      return true;
	    }
	});

  	Meteor.startup(function () {
      Future = Npm.require('fibers/future');

    	deployJobs.startJobs();
    	deployJobs.promote(200);

    	deployJobs.processJobs('deployService', {
    		concurrency: 5,
    		pollInterval: 300,
    		prefetch: 10
    	}, function(job, callback) {
        var service = Services.findOne({_id: job.data.serviceId});
        if (service) {
          var deployer = new ServiceDeployer(service);
          deployer.run();
          console.log("Deployer run finished");
          job.done();
          job.remove();
          callback();
        } else {
          job.done();
          job.remove();
          callback();
        }
    	});

      	if (Environments.find().count() === 0) {
      		Environments.insert({name: "Test Environment"});
    	}
  	});
}
