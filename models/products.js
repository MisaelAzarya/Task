var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  imagePath: {type: String, required:true},
  title: {type: String, required:true},
  description: {type: String, required:true},
  price: {type: Number, required:true},
  color: {type: String, required: true},
  brand: {type: String, required:true},
  stock: {type: Number, required: true},
  size: {type: Array, required: true},
  gender: {type: String, required: true},
  ready: {type: Boolean, required:true},
  upload_date: {type: Date, required: true}
});

module.exports = mongoose.model('Product', schema);
