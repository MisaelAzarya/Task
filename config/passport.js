var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var shipping = require('shipping-indonesia');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');

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
    shipping.getCityById(parseInt(req.body.city), cities => {
      console.log(cities);
      var newUser = new User();
      newUser.email = email;
      newUser.password = newUser.encryptPassword(password);
      newUser.firstName = req.body.f_name;
      newUser.lastName = req.body.l_name;
      newUser.phone = req.body.phone;
      newUser.address = req.body.address;
      newUser.cityId = parseInt(cities.city_id);
      newUser.city = cities.city_name;
      newUser.provinceId = parseInt(cities.province_id);
      newUser.province = cities.province;
      newUser.postalCode = cities.postal_code;
      newUser.save(function(err, result){
        if (err) {
          return done(err);
        }

          var transporter = nodemailer.createTransport({
              host: "smtp.gmail.com", // hostname
              secure: false, // use SSL
              port:587, // port for secure SMTP
              auth: {
                  user: "fituremagang@gmail.com",
                  pass: "doremi123456"
                },
              tls: {
                  rejectUnauthorized: false
              }
          });

          var mailOptions = {
            from: 'fituremagang@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Confirmation Account', // Subject line
            //text: 'Dari '+ req.body.name, //, // plaintext body
            html:
            '<body>'+
            '<div>'+
            '<form action="#" method="post">'+
            '<button tabindex="3" type="submit" style="background-color:light blue;">Confirmation</button>'+
            '</form>'+
            '</div>'+
            '</body>' // You can choose to send an HTML body instead
        }; // untuk email konfirmasi email

          transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                res.json({yo: 'error'});
            }else{
                console.log('Message sent: ' + info.response);
                res.json({yo: info.response});
            };
        });
        return done(null, newUser);
      });
    });
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
