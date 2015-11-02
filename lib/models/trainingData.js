var mongoose = require('../mongo');

var dataSchema = new mongoose.Schema({
  input: [ Number ],
  output: [ Number ]
});

var trainingDataSchema = new mongoose.Schema({
  name: { type: String, index: true },
  data: dataSchema
}, { collection: 'trainingData' });

module.exports = mongoose.model('TrainingData', trainingDataSchema);

