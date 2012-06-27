var mem = [];

exports.derhotzenplotz = function(req, res) {
    var pageObj = {locals: {info: null}};

    if (req.method == 'POST') {
        var email = req.param('email');
        var feedback = req.param('feedback');
        mem.push({
            email: email,
            feedback: feedback
        });

        console.log(req.param('submit'));
        pageObj.locals.info = req.param('submit') + ' Success';
    }
    res.render('demos/derhotzenplotz.jade', pageObj);
};