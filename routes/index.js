var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/products');
var Order = require('../models/order');
var User = require('../models/user');
var Ongkos = require('../models/ongkos');
var Brand = require('../models/brand');

var nodemailer = require('nodemailer');

var shipping = require('shipping-indonesia');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');



/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  // ambil data dari products
  Product.find(function(err, docs){
    var arr = [];
    var length = Math.ceil(docs.length / 10);
    for (var x=1; x<length+1; x++){
      arr.push(x);
    }
    Product.find(function(err, docs){
      var productChunks = [];
      var chunkSize = 3;
      for (var i = 0; i < docs.length; i+= chunkSize) {
        productChunks.push(docs.slice(i, i+ chunkSize));
      }
      res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg,  f_brand: false, length: arr});
    }).limit(9);
  });
});

router.post('/:page', function(req, res, next){
  var successMsg = req.flash('success')[0];
  // ini untuk pagination
  var pages = parseInt(req.params.page);
  var skips = 0;
  //console.log(req.params.page);
//  console.log(req.params.page);
  //console.log(pages);
  if(parseInt(pages) > 1){
    console.log('masuk sini ?');
    skips = parseInt((parseInt(pages)-1) * 9);
  }
  //console.log(skips)
  Product.find(function(err, docs){
    var arr = [];
    var length = Math.ceil(docs.length / 10);
    for (var x=1; x<length+1; x++){
      arr.push(x);
    }
    Product.find(function(err, docss){
      var productChunks = [];
      var chunkSize = 3;
      for (var i = 0; i < docss.length; i+= chunkSize) {
        productChunks.push(docss.slice(i, i+ chunkSize));
      }
      res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg,  f_brand: false, length: arr});
    }).skip(parseInt(skips)).limit(9);
  });
});

// untuk cari berdasarkan brand
router.post('/search', function(req, res, next){
  var keyword=req.body.search;
  const regex = new RegExp(escapeRegex(keyword),'gi');
  Product.find({title:regex},function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    Brand.find(function(err, brands){
      res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg, f_brand: false});
          //res.render('shop/product-detail',{brands:brands,_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
    });
  });
});

// woman
router.get('/woman', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  var gender = "Woman";
  // ambil data dari products
  Product.find({gender: gender}, function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg, f_brand: false});
  });
});

// man
router.get('/man', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  var gender = "Man";
  // ambil data dari products
  Product.find({gender: gender}, function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg, f_brand: false});
  });
});

// brands
router.get('/brand/:name', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  var brand = req.params.name;
  var frombrand = true;
  // ambil data dari products
  Product.find({brand: brand}, function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg, f_brand: frombrand});
  });
});

// untuk masukkan id barang ke cart
router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  // untuk cari produk berdasarkan id nya
  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    // untuk store data cart ke session
    req.session.cart = cart;
    //console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/add-to-cart2/:id', function(req, res, next){
  var message = req.flash('error')[0];
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var productChunks = [];

  Product.find(function(err, docs){
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
  });

  // untuk cari produk berdasarkan id nya
  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    // untuk store data cart ke session
    req.session.cart = cart;
    res.render('shop/product-detail',{_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
  });
});





// untuk masukkan id barang untuk view product detail
router.get('/product-detail/:id', function(req, res, next){
  var message = req.flash('error')[0];
  var productId = req.params.id;
  // untuk cari produk berdasarkan id nya
  var productChunks = [];

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    Product.find({brand:product.brand}, function(err, docs){
      var chunkSize = 3;
      for (var i = 0; i < docs.length; i+= chunkSize) {
        productChunks.push(docs.slice(i, i+ chunkSize));
      }
    }).limit(3);
    Brand.find(function(err, brands){
      res.render('shop/product-detail',{brands:brands,_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color,p_stock:product.stock, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks, message:message, noMessage: !message});
    });
  });
});


// untuk reduceByOne function
router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findOne({_id:productId}, function(err, foundProduct){
    if(foundProduct.stock <= 0){
      foundProduct.ready = true;
    }
    foundProduct.stock = parseInt(foundProduct.stock) + 1;

    foundProduct.save(function(err, result){
      cart.reduceByOne(productId);
      req.session.cart = cart;
      res.redirect('/shopping-cart');
    });
  });
});

// untuk removeItem function
router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findOne({_id:productId}, function(err, foundProduct){
    if(foundProduct.stock <= 0){
      foundProduct.ready = true;
    }
    foundProduct.stock = parseInt(foundProduct.stock) + parseInt(cart.getQty(productId));

    foundProduct.save(function(err, result){
      cart.removeItem(productId);
      req.session.cart = cart;
      res.redirect('/shopping-cart');
    });
  });

});

// parse data ke shopping cart
router.get('/shopping-cart', function(req, res, next){
  console.log('x');
  if(!req.session.cart){
    console.log(1);
    return res.render('shop/shopping-cart', {products: null});
  }
  console.log(2);
  console.log(req.session.cart);
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/contactus', function(req, res, next){
  console.log('2');
  res.render('shop/contactus');
});

// parse data ke checkout
router.get('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }

  var cart = new Cart(req.session.cart);
  User.findOne({_id: req.user._id}, function(err, foundUser){
    var fullName = foundUser.firstName + " " + foundUser.lastName;
    var phone = foundUser.phone;
    var address = foundUser.address;
    var cityId = foundUser.cityId;
    var cityName = foundUser.city;
    shipping.getAllCity(city => {
      res.render('shop/checkout', {total: cart.totalPrice, u_name: fullName, u_phone: phone, u_address: address, u_cId: cityId, u_cName: cityName, cities: city});
    });
  });
});




router.post('/pay', isLoggedIn, function(req, res, next){
  upload(req, res, function (err) {
      if (err){
          req.flash('error', 'Failed to Upload Image!');
          res.redirect('/pay');
      }
      //console.log("just "+ req.body.namaBrg);
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
      //console.log(req.body.orderid+" "+req.body.nama_rek+" "+req.body.bank+" ");
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




module.exports = router;

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
