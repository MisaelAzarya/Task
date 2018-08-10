var Product = require('../models/products');

var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/shopping', { useNewUrlParser: true });

// connect to mongoDB
(async function() {
  try {
    const client = await mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true });
  } catch(e) {
    console.error(e)
  }
})()

var products = [
  new Product({
    imagePath: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/ff3fe091e3ce45649907a88000b07290_9366/Ultraboost_Shoes_Black_BB6179_01_standard.jpg',
    title: 'Adidas Shoes Grey',
    description: 'Sepatu murah berkualitas luar biasa',
    price: 10
  }),
  new Product({
    imagePath: 'https://cdn-img-1.wanelo.com/p/5c2/267/a6c/89586104e8a727d2575cc67/x354-q80.jpg',
    title: 'Adidas Shoes Red',
    description: 'Sepatu murah berkualitas luar biasa',
    price: 20
  }),
  new Product({
    imagePath: 'https://4.imimg.com/data4/CH/TK/ANDROID-34312150/product-250x250.jpeg',
    title: 'Adidas Shoes White',
    description: 'Sepatu murah berkualitas luar biasa',
    price: 30
  }),
];

// untuk save ke database
var done = 0;
for (var i = 0; i < products.length; i++) {
  products[i].save(function(err, result){
    done++;
    if (done === products.length) {
      exit();
    }
  });
}

function exit(){
  mongoose.disconnect();
}
