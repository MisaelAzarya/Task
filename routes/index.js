var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Product = require('../models/products');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  // ambil data dari products
  Product.find(function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg });
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
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/add-to-cart2/:id', function(req, res, next){
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
    console.log(req.session.cart);
    res.render('shop/product-detail',{_id:product._id,product_name:product.title, desc:product.description, img:product.imagePath, price:product.price, products:productChunks});
  });
  //var messages = req.flash('error');
  //res.render('shop/product-detail', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

router.post('/product-detail', function(req, res, next){
  var productId = req.body.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var productChunks = [];

  Product.find(function(err, docs){
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
  });

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    for (i=1;i<req.body.qty;i++){
      cart.addQty(productId);
    }
    // untuk store data cart ke session
    req.session.cart = cart;
    console.log(req.session.cart);
    res.render('shop/product-detail',{_id:product._id,product_name:product.title, desc:product.description, img:product.imagePath, price:product.price, products:productChunks});
  });
});

// untuk masukkan id barang untuk view product detail
router.get('/product-detail/:id', function(req, res, next){
  var productId = req.params.id;
  // untuk cari produk berdasarkan id nya
  var productChunks = [];

  Product.find(function(err, docs){
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
  });
  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    //console.log(req.session.cart);
    res.render('shop/product-detail',{_id:product._id,product_name:product.title, desc:product.description, img:product.imagePath, price:product.price, products:productChunks});
  });
});

// untuk reduceByOne function
router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// untuk removeItem function
router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// parse data ke shopping cart
router.get('/shopping-cart', function(req, res, next){
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

// parse data ke checkout
router.get('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', {total: cart.totalPrice});
});

// ketika button submit pada checkout di klik, maka akan store data ke database
router.post('/checkout', isLoggedIn, function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var order = new Order({
    user: req.user, // data user
    cart: cart, // data cart
    address: req.body.address, // ambil address dari form body
    name: req.body.name // ambil name dari form body
  });
  order.save(function(err, result){
    if(err){
      res.redirect('/checkout');
    }
    req.flash('success', 'Successfully Bought Product!');
    req.session.cart = null;
    res.redirect('/');
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
