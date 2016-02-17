var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(res, req, next) {
        req.render('index', {
            title: 'Catch'
        });
    });

module.exports = router;
