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
                this.response.end(JSON.stringify({
                    error: this.request.method + " method not supported"
                }));
            }

            var requestData = this.request.body;
            this.response.end(JSON.stringify({
                message: "Got it!"
            }));
        }
    });
});