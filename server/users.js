module.exports = {
    findById: findUserById,
    findByLogin: findUserByLogin,
    getAll: getAllUsers,
    create: createUser,
    update: updateUser,
    setPassword: setUserPassword,
    checkPassword: checkUserPassword,
    delete: deleteUser
};

var
    mongoose = require('mongoose'),
    Q = require('q'),
    passwordHash = require('password-hash');

var UserSchema = mongoose.Schema({
    login: String,
    password: String,

    isAdmin: Boolean
});

var User = mongoose.connection.model('User', UserSchema);

_createDefaultUserIfNoUsersExist();

function findUserById(id) {
    return User.findById(id).exec();
}

function findUserByLogin(login) {
    return User.findOne({
        login: login
    }).exec();
}

function getAllUsers() {
    return User.find({}).exec();
}

function createUser(userData) {
    var user = new User(userData);
    user.createdAt = new Date();
    return user.save();
}

function updateUser(user, userData) {
    user.set(userData);
    return user.save();
}

function setUserPassword(user, password) {
    return Q.fcall(function() {
        var hashedPassword = passwordHash.generate(password);
        user.password = hashedPassword;
        return user.save();
    });
}

function checkUserPassword(user, password) {
    return passwordHash.verify(password, user.password);
}

function deleteUser(user) {
    return user.remove();
}



function _createDefaultUserIfNoUsersExist() {
    var self = this;

    User.count().exec()
        .then(function(count) {
            if (count === 0) {
                return self.createUser({
                        login: 'admin',
                        isAdmin: true
                    })
                    .then(function(user) {
                        return self.setUserPassword(user, 'password');
                    });
            }
        })
        .then(null, function(err) {
            console.log(err);
        });
}
