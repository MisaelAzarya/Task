var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  phone: {type: String, required: true},
  address: {type: String, required: true},
  cityId: {type: Number, required: true},
  city: {type: String, required: true},
  provinceId: {type: Number, required: true},
  province: {type: String, required: true},
  postalCode: {type: String, required: true}
});

userSchema.methods.encryptPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
