var User = require('../models/user');
var moment = require('moment');
var md5 = require('js-md5');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.user_gallery_get = function (req, res, next) {
  var gallery = [];
  res.render('gallery.art', {gallery: [1,2,3]});
}

exports.user_avatar_get = function (req, res, next) {
  res.render('avatar.art');
}

exports.user_login_get = function (req, res, next) {
  res.render('login.art')
}

exports.user_login_post = function (req, res, next) {
  User.findOne({
    'username': req.body.username,
    'pwd': md5(req.body.pwd)
  },
    'username', function (err, result) {
      if (err) { return next(err); }

      req.session.regenerate(function (err) {
        req.session.loginUser = result.username;
      })

      res.json({ code: 12000, data: result.username });
    })
}

exports.user_register_get = function (req, res, next) {
  res.render('register.art')
}

exports.user_register_post = [
  body('username').isLength({ min: 1 }).trim(),
  body('pwd').isLength({ min: 6 }).trim(),

  sanitizeBody('username').trim().escape(),
  sanitizeBody('pwd').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ code: 13000, data: errors })
      return;
    } else {
      var createTime = moment().utc(new Date()).utcOffset(480).toDate(); //更改时区
      var pwd = md5(req.body.pwd);

      console.log(createTime)
      var user = new User({
        username: req.body.username,
        pwd: pwd,
        create_time: createTime
      });

      user.save(function (err) {
        if (err) { return next(err) }

        res.json({ code: 12000, data: null });
      })
    }

  }
]
