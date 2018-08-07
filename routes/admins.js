var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Product = require('../models/products');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');

router.get('/verified/:id', function(req, res, next){
  var OrderId = req.params.id;

  Order.findOne({_id:OrderId}, function(err, foundProduct){
    foundProduct.status="Waiting for Orders Sent";
    foundProduct.verified = true;

    foundProduct.save(function(err, result){
          res.redirect('/user/admin');
    });
  });
});


router.post('/inputresi', function(req, res, next){
  var OrderId = req.body.order_id;
  var resi = req.body.resi;

  Order.findOne({_id:OrderId}, function(err, foundProduct){
    foundProduct.sent = true;
    foundProduct.status = "Orders had Sent";
    foundProduct.resi=resi;

    foundProduct.save(function(err, result){
          res.redirect('/user/admin');
    });
  });
});


router.get('/deletetrans/:id', function (req, res, next){
  var orderId = req.params.id;
  Order.findByIdAndRemove(orderId,function(err, order){
    if(err){
      return res.write('Error!');
    }
    res.redirect("/user/admin");
  });
});

module.exports = router;
