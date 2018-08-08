var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    order_id: {type: Schema.Types.ObjectId, ref: 'Order'},
    nama_rek: {type: String, required: true},
    bank: {type: String, required: true},
    no_rek: {type: String, required: true},
    imagePath: {type: String, required: true}
});

module.exports = mongoose.model('Rekening', schema);
