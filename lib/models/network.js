var mongoose = require('../mongo');

var networkSchema = new mongoose.Schema({
  name: { type: String, index: true },
  data: Object
}, {collection: 'networks'});

module.exports = mongoose.model('Network', networkSchema);

