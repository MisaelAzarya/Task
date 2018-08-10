var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Product = require('../models/products');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var shipping = require('shipping-indonesia');
var Banner = require('../models/banner');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');

var csrfProtection = csrf();
router.use(csrfProtection);

// ketika terima user/profile dari successRedirect
router.get('/profile', isLoggedIn,function(req, res, next){
  // untuk ambil data order berdasarkan user id
  Order.find({user: req.user}, function(err, orders){
    if(err){
      return res.write('Error!');
    }
    var cart;
    orders.forEach(function(order){
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {orders: orders});
  });
});



//get admin page
router.get('/admin', function(req, res, next){
  Order.aggregate(  [ {
    "$lookup": {
        "from": "rekenings",
        "localField": "_id",
        "foreignField": "order_id",
        "as": "rek"
    }
  },
  {
    "$match":{"$and":[{"canceled":false},{"done":false}]}
  }]
  ).exec((err, orders)=>{
    if(err){
      return res.write('Error!');
    }
    else{
      var successMsg = req.flash('success')[0];
      var cart;
      var ongkir;
      var productChunks = [];
      var userChunks = [];
      var bannerChunks =[];
      orders.forEach(function(order){
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      //console.log(orders);
      Product.find(function(err, docs){
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i+= chunkSize) {
          productChunks.push(docs.slice(i, i+ chunkSize));
        }
            User.find(function(err, docs){
              var chunkSize = 3;
              for (var i = 0; i < docs.length; i+= chunkSize) {
                userChunks.push(docs.slice(i, i+ chunkSize));
              }

          });

          Banner.find(function(err, docs){
            var chunkSize = 3;
            for (var i = 0; i < docs.length; i+= chunkSize) {
              bannerChunks.push(docs.slice(i, i+ chunkSize));
            }

        });
      //res.render('user/admin',{products: productChunks,orders: orders});
    });
    res.render('admins/admin',{products: productChunks, orders: orders, users:userChunks, banners:bannerChunks,successMsg: successMsg,noMessage: !successMsg,});
  };
});
});


router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  res.redirect('/');
});

// di atas ini fungsi yang tidak bisa dijalankan ketika belum login
// di bawah ini fungsi yang bisa dijalankan ketika belum login
router.use('/', notLoggedIn, function(req, res, next){
  next();
});

// ketika ingin masuk ke user/signup
router.get('/signup', function(req, res, next){
  var messages = req.flash('error');
  shipping.getAllCity(city => {
    res.render('user/signup', {csrfToken: req.csrfToken(), city:city , messages: messages, hasErrors: messages.length > 0});
  });
});

// ketika button submit dari user/signup di klik, maka masuk ke sini
router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next){
  if (req.session.oldUrl){ // ketika belum login, tp mau checkout maka setelah signup akan diarahkan kembali ke menu checkout
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else { // untuk sign up biasa
    res.redirect('/user/profile');
  }
});

// ketika ingin masuk ke user/signin
router.get('/signin', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function(req, res, next){
  if (req.session.oldUrl){ // ketika belum login, tp mau checkout maka setelah signup akan diarahkan kembali ke menu checkout
    console.log(req.csrfToken);
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else { // untuk login biasa
    res.redirect('/user/profile');
  }
});



module.exports = router;

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next){
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
