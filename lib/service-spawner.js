function ServiceSpawner() {

}

ServiceSpawner.prototype.spawnService = function(service) {
	var job = deployJobs.createJob(
		'deployService',
	    {
	      	serviceId: service._id
	    }
	);

	job.save();
};

serviceSpawner = new ServiceSpawner();