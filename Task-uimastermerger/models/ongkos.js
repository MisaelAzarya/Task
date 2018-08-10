var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    transid: {type: String, required: true},
    tgl: {type: Date, required: true},
    service: {type: String, required: true},
    value: {type: Number, required: true},
    etd: {type: String, required: true}
});

module.exports = mongoose.model('Ongkos', schema);
