module.exports = {
    addAuthToExpressApp: addAuthToExpressApp
};

var users = require('./users');

function addAuthToExpressApp(app) {
    var session = require('cookie-session'),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;

    app.use(session({
        secret: global.config.sessionSecret
    }));

    app.use(passport.initialize());

    app.use(passport.session());

    passport.use(new LocalStrategy(
        function(login, password, callback) {
            users.findByLogin(login)
                .then(function(user) {
                    if (!user) {
                        return callback(null, false, {message: 'User not found'});
                    }

                    if (!users.checkPassword(user, password)) {
                        return callback(null, false, {message: 'Incorrect password'});
                    }

                    return callback(null, user);
                })
                .then(null, function(err) {
                    return callback(err);
                });
        }
    ));

    passport.serializeUser(function(user, callback) {
        callback(null, user.id);
    });

    passport.deserializeUser(function(id, callback) {
        users.findById(id)
            .then(function(user) {
                return callback(null, user);
            })
            .then(null, function(err) {
                return callback(err);
            });
    });

    app.get('/login', function(req, res) {
        res.render("login", {failure: req.param('failure')});
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/login');
    });

    app.post('/login', passport.authenticate('local', { failureRedirect: '/login?failure=1'}), function(req, res) {
        res.redirect('/');
    });

    app.all('*', function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        if (req.url.match(/^\/api/)) {
            res.json({"error": "Not authenticated"});
        } else {
            res.redirect('/login');
        }
    });
}
