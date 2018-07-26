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

module.exports = mongoose.model('Coba', schema);
