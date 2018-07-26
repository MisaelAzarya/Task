var express = require('express');
var router = express.Router();
var multer = require('multer');

var Coba = require('../models/coba');
var Product = require('../models/products');

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
    res.render('shop/inputBarang');
});

router.post('/inputBarang', function (req, res) {
    upload(req, res, function (err) {
        if (err){
            res.redirect('/checkout');
        }

        // Everything went fine
        var tbhBarang = new Product({
            imagePath: req.file.path,
            title: req.body.namaBrg,
            description: "Apa aja boleh deh",
            price: 50
        });
        tbhBarang.save(function(err, result){
            if(err){
                res.redirect('/checkout');
              }
              req.flash('success', 'Successfully Tambah Product!');
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


module.exports = router;
