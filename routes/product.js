var express = require('express');
var router = express.Router();
var multer = require('multer');
var User = require('../models/user');
var Coba = require('../models/coba');
var Product = require('../models/products');
var Order = require('../models/order');
var Brand = require('../models/brand');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
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

var upload = multer({ storage: storage }).single('productImage');

router.get('/inputBarang', function (req, res, next){
    var messages = req.flash('error')[0];
    Brand.find(function(err, brands){
        res.render('admin/inputBarang', {brands: brands, messages:messages, hasErrors: !messages});
      });

});

router.post('/inputBarang', function (req, res) {
    upload(req, res, function (err) {
        if (err){
            req.flash('error', 'Failed to Upload Image Product!');
            res.redirect('/inputBarang');
        }

        // Everything went fine
        var addProduct = new Product({
            imagePath: req.file.path,
            title: req.body.namaBrg,
            description: req.body.desc,
            price: req.body.price,
            color: req.body.color,
            brand: req.body.brand,
            stock: req.body.stock,
            size: req.body.size,
            gender: req.body.gender
        });
        addProduct.save(function(err, result){
            if(err){
                req.flash('error', 'Something Wrong When Add new Product');
                res.redirect('/inputBarang');
              }
              req.flash('success', 'Successfully Add New Product!');
              res.redirect('/');
        });

        // var inputBarang = new Coba({
        //     name: req.body.namaBrg,
        //     stock: req.body.stock,
        //     gender: req.body.gender,
        //     ukuran: req.body.size,
        //     brand: req.body.brand,
        //     productImage: req.file.path
        // });
        // inputBarang.save(function(err, result){
        //     if(err){
        //       res.redirect('/checkout');
        //     }
        //     req.flash('success', 'Successfully Tambah Product!');
        //     res.redirect('/');
        // });

    })
})

router.get('/delete/:id', function (req, res, next){
  Product.findByIdAndRemove(req.params.id,function(err, product){
    Order.find(function(err, orders){
      if(err){
        return res.write('Error!');
      }
      var cart;
      orders.forEach(function(order){
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });

        Product.find(function(err, docs){
          var productChunks = [];
          var chunkSize = 3;
          for (var i = 0; i < docs.length; i+= chunkSize) {
            productChunks.push(docs.slice(i, i+ chunkSize));
          }
              User.find(function(err, docs){
                var userChunks = [];
                var chunkSize = 3;
                for (var i = 0; i < docs.length; i+= chunkSize) {
                  userChunks.push(docs.slice(i, i+ chunkSize));
                }
              res.render('user/admin',{products: productChunks, orders: orders, users:userChunks});
            });
        //res.render('user/admin',{products: productChunks,orders: orders});
      });
    });
  // As always, handle any potential errors:
  //if (err) return res.render('/user/admin');
  // We'll create a simple object to send back with a message and the id of the document that was removed
  // You can really do this however you want, though.
  });
});


module.exports = router;
