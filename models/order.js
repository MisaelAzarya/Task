var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    cityId: {type: Number, required: true},
    done: {type: Boolean, required: true},
    status: {type: Boolean, required: true},
    trans_date: {type: Date, required: true},
    ongkir: {type: Object, required: true}
});

module.exports = mongoose.model('Order', schema);