var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var passport = require('passport');
var Product = require('../models/products');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var Refund = require('../models/refund');
var nodemailer = require('nodemailer');
var Ongkos = require('../models/ongkos');
var Rekening = require('../models/rekening');
var multer = require('multer');

var shipping = require('shipping-indonesia');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/buktitrf');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

var fileFilter = function(req, file, cb){
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
};

var upload = multer({ storage: storage }).single('bktImage');

router.post('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
    var cart = new Cart(req.session.cart);
    var tanggal = new Date();
    var weight = parseInt(cart.totalQty) * 1000; // ibarat 1 sepatu 1 kg

    shipping.getShippingCost(457, req.body.city, weight, req.body.courier, ongkir => {
      var order = new Order({
        user: req.user, // data user
        cart: cart, // data cart
        address: req.body.address, // ambil address dari form body
        name: req.body.name, // ambil name dari form body
        phone: req.body.phone,
        cityId: parseInt(req.body.city),
        trans_date: tanggal, // untuk tanggal transaksi
        ongkir: ongkir, // untuk ongkir
        status:"Waiting For Payment",
        kurir:req.body.courier,
        service:"-",
        resi: "-",
        done: false, // done itu untuk cek apakah sudah bayar atau belum
        canceled: false,// cek apakah pesanan di cancel
        paid: false, // cek apakah sudah bayar atau belum
        verified: false, // cek apakah bukti trf sudah benar atau belum
        sent: false // untuk cek udh dikirim apa belum
      });
      order.save(function(err, result){
        if(err){
          console.log('gagal kah ?');s
          res.redirect('/checkout');
        }
        else{
          var orderid = String(order._id);
          var flag = false;
          for(var i=0;i<result.ongkir.results[0].costs.length;i++){
            if(i == result.ongkir.results[0].costs.length - 1){
              flag = true;
              console.log('x');
            }
            var listongkir = new Ongkos({
              transid: orderid,
              tgl: tanggal,
              service: result.ongkir.results[0].costs[i].service,
              value: result.ongkir.results[0].costs[i].cost[0].value,
              etd: result.ongkir.results[0].costs[i].cost[0].etd
            });
            listongkir.save(function(err, berhasil){
              if(err){
                console.log("gk nyimpen ke db");
              }
              else{
                if(flag){
                  Ongkos.find({transid: orderid}, function(err, hasil){
                    if(err){
                      console.log("gagals");
                      res.redirect('/checkout');
                    }
                    else{
                      i = result.ongkir.results[0].costs.length;
                      flag = false;
                      //req.flash('success', 'Waiting For Payment');

                      res.render('shop/payment', {ongkir: hasil});
                    }
                  });
                }
              }
            });
          }
        }
      });
    });
});

router.post('/paynow', isLoggedIn, function(req, res, next){
  var orderId = req.body.orderId;
  var value = req.body.value;
  var service = req.body.service;

  Order.findOne({_id: orderId}, function(err, foundObject){
    var cart = new Cart(req.session.cart);
    cart.addTotal(value);
    foundObject.cart = cart;
    foundObject.service=service;
    foundObject.save(function(err, result){
      var total = cart.getTotal();
      req.session.cart = null;
      res.render('user/transaction',{orderId:orderId, total: total});
    });
  });
});

router.post('/paynowfromprofile', isLoggedIn, function(req, res, next){
    var orderId=req.body.orderid;

    res.render('user/transaction',{orderId:orderId});
});

router.post('/pay', isLoggedIn, function(req, res, next){
  upload(req, res, function (err) {
    if (err){
      req.flash('error', 'Failed to Upload Image!');
      res.redirect('/pay');
    }
    // Everything went fine
    var addPay = new Rekening({
      order_id:req.body.orderid,
      nama_rek: req.body.nama_rek,
      bank: req.body.bank,
      no_rek: req.body.no_rek,
      imagePath:req.file.path
    });

    Order.findById(req.body.orderid,function(err, foundObject){
      foundObject.status ="Waiting for Payment Verification";
      foundObject.paid=true;
      foundObject.save(function(err, updatedObject){
        if (err){
          res.status(500).send();
        }
      });
    });

    addPay.save(function(err, result){
      if(err){
        req.flash('error', 'Something Wrong When Bought Product');
        res.redirect('/pay');
      }
        req.flash('success', 'Successfully Bought Product');
        res.redirect("/");
    });
  });
});

router.get('/refund/:id',function(req, res){
  Refund.findOne({order_id:req.params.id},function(err,result){
    console.log('x');
    console.log(result.total);
    res.render('user/refundevidence',{total:result.total, order_id:result.order_id,nama_rek:result.nama_rek,bank:result.bank, no_rek:result.no_rek,imagePath:result.imagePath});
  });
});

module.exports = router;

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
