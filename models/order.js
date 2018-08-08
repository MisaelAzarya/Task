var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    status:{type: String, required: true},
    resi:{type: String, required: true},
    done: {type: Boolean, required: true},
    canceled:{type: Boolean, required: true},
    paid:{type: Boolean, required: true},
    verified:{type: Boolean, required: true},
    sent:{type: Boolean, required: true}
});

module.exports = mongoose.model('Order', schema);
