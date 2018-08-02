var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Product = require('../models/products');
var Order = require('../models/order');
var User = require('../models/user');

var shipping = require('shipping-indonesia');
shipping.init('25134fceb7cf5271a12a2bade0c54fce');
var hbs = require('hbs');
hbs.registerHelper('equal', require('handlebars-helper-equal'));

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
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg });
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
    res.render('shop/product-detail',{_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
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

  Product.findOne({_id:productId}, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    for (i=1;i<req.body.qty;i++){
      cart.addQty(productId);
    }
    product.stock = parseInt(product.stock) - parseInt(req.body.qty);
    if(product.stock <= 0){
      product.ready = false;
      product.stock = 0;
    }
    product.save(function(err, updatedProduct){
      if(err){
        return res.redirect('/');
      }
      // untuk store data cart ke session
      req.session.cart = cart;
      console.log(req.session.cart);
      res.render('shop/product-detail',{_id:updatedProduct._id,product_name:updatedProduct.title,p_brand:updatedProduct.brand, p_color:updatedProduct.color,p_stock:updatedProduct.stock, p_size:updatedProduct.size,p_gender:updatedProduct.gender, desc:updatedProduct.description, img:updatedProduct.imagePath, price:updatedProduct.price, p_ready:updatedProduct.ready, products:productChunks});
    });
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
    res.render('shop/product-detail',{_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color,p_stock:product.stock, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
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
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/contactus', function(req, res, next){
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

// ketika button submit pada checkout di klik, maka akan store data ke database
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
      done: false, // done itu untuk cek apakah sudah bayar atau belum
      status: false, // untuk cek status udh dikirim apa belum
      trans_date: tanggal, // untuk tanggal transaksi
      ongkir: ongkir // untuk ongkir
    });
    order.save(function(err, result){
      if(err){
        console.log("gagal");
        res.redirect('/checkout');
      }
      else{
        req.flash('success', 'Successfully Bought Product!');
        req.session.cart = null;
        console.log(result.ongkir.results.costs);
        res.render('shop/payment', {orderDetail:result, ongkir: ongkir.results});
      }
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
