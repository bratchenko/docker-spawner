module.exports = {
    addAuthToExpressApp: addAuthToExpressApp,
    addAuthToSocketIo: addAuthToSocketIo
};

var users = require('./users'),
    cookieSession = require('cookie-session'),
    sessionStore = cookieSession({
        secret: global.config.sessionSecret
    }),
    socketIoPassport = require('./socket-io-passport'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

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

function addAuthToExpressApp(app) {
    app.use(sessionStore);

    app.use(passport.initialize());

    app.use(passport.session());

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

function addAuthToSocketIo(io) {
    io.use(socketIoPassport(
        sessionStore,
        passport.initialize(),
        passport.session()
    ));
}
