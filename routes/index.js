module.exports = function(app) {

    function renderIndex(req, res) {
        res.render('index', {
            user: req.user || {}
        });
    }

    app.get('/', renderIndex);
    app.get('/services', renderIndex);
    app.get('/services/:serviceId', renderIndex);
    app.get('/groups', renderIndex);
    app.get('/groups/:groupId', renderIndex);
    app.get('/destinations', renderIndex);
    app.get('/destinations/:destinationId', renderIndex);
    app.get('/users', renderIndex);

};
