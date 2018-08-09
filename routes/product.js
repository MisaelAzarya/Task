var express = require('express');
var router = express.Router();
var multer = require('multer');
var Product = require('../models/products');
var Brand = require('../models/brand');
var Order = require('../models/order');
var User = require('../models/user');

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

// untuk masuk ke menu input barang
router.get('/inputBarang', function (req, res, next){
    var messages = req.flash('error')[0];
    Brand.find(function(err, brands){
        res.render('admins/inputBarang', {brands: brands, messages:messages, hasErrors: !messages});
      });
});

router.get('/updateBarang/:id', function (req, res, next){
    var messages = req.flash('error')[0];
      Product.findById(req.params.id, function(err, product){
            res.render('admins/updateBarang', {p_stock:product.stock,_id:product._id,product_name:product.title,p_brand:product.brand,
              p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, messages:messages, hasErrors: !messages});
      });
});

router.post('/updateBarang/:id', function (req, res) {

      Product.findById(req.params.id,function(err, foundObject){
            if(err){
                req.flash('error', 'Something Wrong When Update Product');
                res.redirect('/updateBarang');
              }

              foundObject.description=req.body.desc;
              foundObject.price= parseInt(req.body.price);
              foundObject.color= req.body.color;
              //foundObject.size= req.body.size;
              foundObject.stock= parseInt(req.body.stock);


              foundObject.save(function(err, updatedObject){
                  if (err){
                     res.status(500).send();
                  }
                  res.redirect('/user/admin');
             });
        });

});

router.post('/inputBarang', function (req, res) {
    upload(req, res, function (err) {
        if (err){
            req.flash('error', 'Failed to Upload Image Product!');
            res.redirect('/inputBarang');
        }
        // Everything went fine
        var tanggal = new Date;
        var addProduct = new Product({
            imagePath: req.file.path,
            title: req.body.namaBrg,
            description: req.body.desc,
            price: req.body.price,
            color: req.body.color,
            brand: req.body.brand,
            stock: req.body.stock,
            size: req.body.size,
            gender: req.body.gender,
            ready: true,
            upload_date: tanggal
        });
        addProduct.save(function(err, result){
            if(err){
                req.flash('error', 'Something Wrong When Add new Product');
                res.redirect('/inputBarang');
              }
              req.flash('success', 'Successfully Add New Product!');
              res.redirect('/user/admin');
        });
    })
});

router.get('/updateBarang/:id', function (req, res, next){
    var messages = req.flash('error')[0];
        Product.findById(req.params.id, function(err, product){
            res.render('admins/updateBarang', {p_stock:product.stock,_id:product._id,product_name:product.title,p_brand:product.brand, p_color:product.color, p_size:product.size,p_gender:product.gender, desc:product.description, img:product.imagePath, price:product.price, p_ready:product.ready, messages:messages, hasErrors: !messages});
        });
});

router.post('/updateBarang/', function (req, res) {
    var id = req.body.id;
    Product.findById(id,function(err, foundObject){
        if(err){
            req.flash('error', 'Something Wrong When Update Product');
            res.redirect('/updateBarang');
            }

            foundObject.description=req.body.desc;
            foundObject.price= parseInt(req.body.price);
            foundObject.color= req.body.color;
            foundObject.stock= parseInt(req.body.stock);
            foundObject.save(function(err, updatedObject){
                if (err){
                    res.status(500).send();
                }
                res.redirect('/user/admin');
            });
    });

});

// untuk delete data product
router.get('/delete/:id', function (req, res, next){
  Product.findByIdAndRemove(req.params.id,function(err, product){
    if(err){
        return res.write('Error!');
    }
    var fs = require('fs');
    fs.unlink(product.imagePath, function() {
        res.redirect("/user/admin");
    });
  });
});

// untuk update stock product
router.post('/update', function(req, res, next){
    var id = req.body.id;
    Product.findOne({_id: id}, function(err, foundObject){
        if (err){
            res.status(500).send();
        }
        foundObject.stock = parseInt(foundObject.stock) + parseInt(req.body.qty);
        if(req.body.qty > 0){
            foundObject.ready = true;
        }
        foundObject.save(function(err, updatedObject){
            if (err){
                res.status(500).send();
            }
            res.redirect('/user/admin');
        });
    });
});

module.exports = router;
