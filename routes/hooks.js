module.exports = function(app) {

    app.post('/hooks/image-updated', function(req, res, next) {
        console.log("IMAGE UPDATED", req.body);
        res.send(204);
    });

};
