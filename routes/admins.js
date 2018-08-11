var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var passport = require('passport');
var Product = require('../models/products');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var nodemailer = require('nodemailer');
var Ongkos = require('../models/ongkos');
var Banner = require('../models/banner');
var Refund = require('../models/refund');
var multer = require('multer');
var sizeOf = require('image-size');
var shipping = require('shipping-indonesia');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');

router.get('/verified/:id', function(req, res, next){
  var OrderId = req.params.id;

  Order.findOne({_id:OrderId}, function(err, foundProduct){
    foundProduct.status="Waiting for Orders Sent";
    console.log(foundProduct.verified);
    foundProduct.verified = true;
    console.log(foundProduct.verified);
    foundProduct.save(function(err, result){
      console.log(foundProduct.name);
          res.redirect('/user/admin');
    });
  });
});

router.get('/canceled/:id', function(req, res, next){
  var OrderId = req.params.id;

  Order.findOne({_id:OrderId}, function(err, foundProduct){
    foundProduct.status="Canceled and Waiting For Refund";
    foundProduct.done=false;
    foundProduct.canceled = true;

    foundProduct.save(function(err, result){
          res.redirect('/user/admin');
    });
  });
});

router.get('/done/:id', function(req, res, next){
  var OrderId = req.params.id;

  Order.findOne({_id:OrderId}, function(err, foundProduct){
    foundProduct.status="Done";
    foundProduct.done = true;

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

router.post('/sendemail',function(req, res){
  console.log('hai');
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

    /*var mailOptions = {
      from: 'fituremagang@gmail.com', // sender address
      to: 'fituremagang@gmail.com', // list of receivers
      subject: 'Question', // Subject line
      //text: 'Dari '+ req.body.name, //, // plaintext body
      html: '<p>Dari : '+ req.body.name+'</p><br>Email :'+req.body.email+'<br>'+'<p>'+req.body.body+'</p>' // You can choose to send an HTML body instead
  };*/ //untuk email di contact us

  var mailOptions = {
    from: 'fituremagang@gmail.com', // sender address
    to: 'fituremagang@gmail.com', // list of receivers
    subject: 'Question', // Subject line
    //text: 'Dari '+ req.body.name, //, // plaintext body
    html:
    '<body>'+
    '<div>'+
    '<form action="#" method="post">'+
    '<button tabindex="3" type="submit" style="background-color:#87CEEB;">Confirm</button>'+
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
  res.redirect('/contactus');
});


router.get('/profile/:id',function(req, res, next){
  // untuk ambil data order berdasarkan user id
  Order.find({user:req.params.id}, function(err, orders){
    if(err){
      return res.write('Error!');
    }
    var cart;
    orders.forEach(function(order){
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
      //order.trans_date =order.trans_date.substring(0,10);
    });
    res.render('admins/seeprofile', {orders: orders});
  });
});

router.get('/inputbanner',function(req, res, next){
  // untuk ambil data order berdasarkan user id
    res.render('admins/inputbanner');
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/banner');
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

var upload = multer({ storage: storage }).single('banner');

router.post('/inputbanner', function(req, res, next){
  upload(req, res, function (err) {
    if (err){
      console.log('A');
      req.flash('error', 'Failed to Upload Image!');
      res.redirect('/inputbanner');
    }

    // Everything went fine
    var addBanner = new Banner({
      imagePath:req.file.path,
      title:req.body.title,
      description:req.body.desc,
      slogan:req.body.slogan,
      showslogan:false
    });


    addBanner.save(function(err, result){
      if(err){
        console.log('B');
        req.flash('error', 'Something Wrong When Bought Product');
        res.redirect("/user/admin");
      }
      var dimensions = sizeOf(addBanner.imagePath);
      if(dimensions.width!=960 && dimensions.height!=330){
        Banner.findByIdAndRemove(addBanner._id,function(err, banner){
          if(err){
            console.log('A');
          }
          var fs = require('fs');
          fs.unlink(banner.imagePath, function() {
          });
        });
        //req.flash('error', 'Wrong Size');
        //res.redirect('/admins/inputbanner');
      }
        //req.flash('success', 'Successfully Input New Banner');
        res.redirect("/user/admin");
    });
  });
});

router.get('/deletebanner/:id', function (req, res, next){
  Banner.findByIdAndRemove(req.params.id,function(err, banner){
    if(err){
        return res.write('Error!');
    }
    var fs = require('fs');
    fs.unlink(banner.imagePath, function() {
        res.redirect("/user/admin");
    });
  });
});

router.get('/showornot/:id', function (req, res, next){
  Banner.findById(req.params.id,function(err, banner){
    if(err){
        return res.write('Error!');
    }
    if(banner.showslogan==true){
      banner.showslogan=false;
    }
    else {
      banner.showslogan=true;
    }

    banner.save(function(err, result){});
    res.redirect("/user/admin");
  });
});


router.get('/refund',function(req, res, next){
  Order.aggregate(  [ {
    "$lookup": {
        "from": "rekenings",
        "localField": "_id",
        "foreignField": "order_id",
        "as": "rek"
    }
  },
  {
    "$match":{"$and":[{"canceled":true},{"done":false}]}
  }]
  ).exec((err, orders)=>{
    if(err){
      return res.write('Error!');
    }
    else{
      var cart;

      orders.forEach(function(order){
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      //console.log(orders);
    //res.render('admins/refundtable');
    res.render('admins/refundtable',{orders: orders});
  };
});
  // untuk ambil data order berdasarkan user id

});

var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/refunds');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

var upload2 = multer({ storage: storage2 }).single('bktRefund');

router.post('/refund', function(req, res, next){

    var orderId= req.body.orderid;
    var nama = req.body.nama_rek;
    var bank =req.body.bank;
    var no=req.body.no_rek;
    var total = req.body.total;

    console.log(req.body.total);
    res.render('admins/refund',{orderId:orderId, nama:nama,bank:bank, no_rek:no,total:total});

});

router.post('/updaterefund', function(req, res, next){
  upload2(req, res, function (err) {
    if (err){
      console.log('A');
      req.flash('error', 'Failed to Upload Image!');
      //res.redirect('/inputbanner');
    }
    Order.findById(req.body.orderid,function(req, result){
      result.status="Refunded";
      result.done=true;
      result.save(function(err, result){
      });

    });
    console.log('x1');
    var refund = new Refund({
      order_id:req.body.orderid,
      nama_rek:req.body.nama,
      bank:req.body.bank,
      no_rek:req.body.no_rek,
      total:req.body.total,
      imagePath: req.file.path
    });
    refund.save(function(err,rez){
        console.log('x2');
        res.redirect("/user/admin");
      });
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
