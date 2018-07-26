<<<<<<< HEAD

=======
>>>>>>> 3c81c72e069199fc73a6cedd62e9487e7223e6ec
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    stock: {type: Number, required: true},
    gender: {type: String, required: true},
    ukuran: {type: Array, required: true},
    brand: {type: String, required: true},
    productImage: {type: String, required: true}
});

<<<<<<< HEAD
module.exports = mongoose.model('Coba', schema);
=======
module.exports = mongoose.model('Coba', schema);
>>>>>>> 3c81c72e069199fc73a6cedd62e9487e7223e6ec
