module.exports = function (req, res, next) {
    res.sendHttpError = function(error) {
        console.log('err: ', error);
        res.status(error.status);
        return ((res.req.headers['x-requested-with'] == 'XMLHttpRequest')
            ? res.json(error)
            : res.render("error", {error: error})
            );

    };
    next();
};
