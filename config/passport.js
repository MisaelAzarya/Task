var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

// store id in session
passport.serializeUser(function(user, done){
  done(null, user.id);
});

// retrive user from session id
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  })
});

//untuk sign up
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'pass',
  passReqToCallback: true
}, function(req, email, password, done){
  // untuk validasi email & password
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('pass', 'Invalid password').notEmpty().isLength({min:4});
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  User.findOne({'email': email}, function(err, user){
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, false, {message: 'Email is already in use.'});
    }
    var newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function(err, result){
      if (err) {
        return done(err);
      }
      return done(null, newUser);
    })
  });
}));

// untuk sign in
passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'pass',
  passReqToCallback: true
}, function(req, email, password, done){
  // untuk validasi email & password
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('pass', 'Invalid password').notEmpty().isLength({min:4});
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({'email': email}, function(err, user){
    if (err) {
      return done(err);
    }
    if (!user || !user.validPassword(password)) {
      return done(null, false, {message: 'Invalid email or password !'});
    }
    return done(null, user);
  });
}));
