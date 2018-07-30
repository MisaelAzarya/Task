var express = require('express');
var router = express.Router();
var Brand = require('../models/brand');
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

router.get('/manwoman/:gender', function(req, res, next) {
  var gender=req.params.gender;
  Product.find({gender:gender},function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+= chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    Brand.find(function(err, brands){
      res.render('shop/manwoman', { title: 'Shopping Cart', products: productChunks, brands:brands});
          //res.render('shop/product-detail',{brands:brands,_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
    });

  });
});
//get page with woman category
/*router.get('/index/:id', function(req, res, next) {
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
});*/

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
  Product.findById(productId,function(err, product){
    if(err){
      return res.redirect('/');
    }
    //console.log(req.session.cart);
    Brand.find(function(err, brands){
          res.render('shop/product-detail',{brands:brands,p_stock:product.stock,_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
    });
    //res.render('shop/product-detail',{_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color,p_stock:product.stock, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, products:productChunks});
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
    name: req.body.name, // ambil name dari form body
    done: false // done itu untuk cek apakah sudah bayar atau belum
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
