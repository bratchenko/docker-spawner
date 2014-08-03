module.exports = function(app) {

    var users = require('../../server/users');

    app.all('/api/users*', function(req, res, next) {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            return next(new Error("Access Denied"));
        }
    });

    app.get('/api/users', function(req, res) {
        res.json(users.getAll());
    });

    app.post('/api/users', function(req, res) {
        res.json(
            users.create(req.body)
                .then(function(user) {
                    return users.setPassword(user, req.body.password);
                })
        );
    });

    app.get('/api/users/:userId', function(req, res, next) {
        users.findById(req.params.userId, function(err, user) {
            if (err) return next(err);

            res.json(user);
        });
    });

    app.post('/api/users/:userId', function(req, res, next) {
        users.findById(req.params.userId, function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error("User not found"));

            users.update(user, req.body, function(err, user) {
                if (err) return next(err);

                res.json(user);
            });
        });
    });

    app.post('/api/users/:userId/change-password', function(req, res, next) {
        users.findById(req.params.userId, function(err, user) {
            if (err) return next(err);
            if (!user) return res.send(204);

            users.setPassword(user, req.body.password, function(err) {
                if (err) return next(err);

                res.send(204);
            });
        });

    });

    app.delete('/api/users/:userId', function(req, res, next) {
        users.findById(req.params.userId, function(err, user) {
            if (err) return next(err);
            if (!user) return res.send(204);

            users.delete(user, function(err) {
                if (err) return next(err);

                res.send(204);
            });
        });
    });

};
