/*
Creates a socket.io (> 1.0) middleware that authenticates user using middleware provided by you.
It depends on passport's "req.isAuthenticated" method to determine if user is authenticated.

You can use whatever session and other middleware you like.

Example usage:

io.use(socketIoPassport(
    cookieSession({
        secret: 'session-secret'
    }),
    passport.initialize(),
    passport.session()
));
*/
var
    http = require('http'),
    async = require('async');

module.exports = function() {

    var middlewareList = Array.prototype.slice.call(arguments, 0);

    return function(socket, next) {
        var headers = socket.request.headers;

        var fakeReq = new http.IncomingMessage();
        fakeReq.headers = headers;

        var fakeRes = {on: function() {}};

        async.forEachSeries(
            middlewareList,
            function(middleware, callback) {
                return middleware(fakeReq, fakeRes, callback);
            },
            function(err) {
                if (err) return next(err);

                if (fakeReq.isAuthenticated()) {
                    socket.user = fakeReq.user;
                    return next();
                } else {
                    return next(new Error("Authentication failed"));
                }
            }
        );
    };
};
