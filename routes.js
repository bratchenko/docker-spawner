Router.map(function () {

    this.route('environments', {
        path: '/',
        layoutTemplate: 'layout',
        template: 'environments',
    });

    this.route('environment', {
        path: '/environments/:id',
        layoutTemplate: 'layout',
        template: 'environments',
        data: function() {
            return {
                environment: Environments.findOne({_id: this.params.id})
            };
        }
    });

    this.route('newImageEvent', {
        path: '/api/events/new-image',
        where: 'server',
        action: function() {
            this.response.setHeader('Content-Type', 'application/json');

            if (this.request.method !== 'POST') {
                return this.response.end(JSON.stringify({
                    error: this.request.method + " method not supported"
                }));
            }

            var imageString = this.request.body.image;
            if (!imageString) {
                return this.response.end(JSON.stringify({
                    error: "image parameter is required"
                }));
            }
            var parts = imageString.split(":");
            if (parts.length < 2) {
                return this.response.end(JSON.stringify({
                    error: "image should be <image name>:<tag>"
                }));
            }
            var imageTag = parts.pop();
            var imageName = parts.join(":");

            var servicesToSpawn = Services.find({imageName: imageName, imageTag: imageTag});

            servicesToSpawn.forEach(function(service) {
                serviceSpawner.spawnService(service);
            });

            var requestData = this.request.body;
            this.response.end(JSON.stringify({
                success: true
            }));
        }
    });
});