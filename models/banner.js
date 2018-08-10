var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  imagePath: {type: String, required:true},
  title: {type: String, required:true},
  description: {type: String, required:true},
  slogan: {type: String, required:true},
  start_date: {type: Date, required:true},
  end_date: {type: Date, required: true}
});

module.exports = mongoose.model('Banner', schema);
