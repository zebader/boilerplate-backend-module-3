const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workerSchema = new Schema({
    name : { type:String, required:true },
    type : String,
    rating : { type: Number, min:0, max:5, default:0},
    tips : { type: Number, min:0, default:0}}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;


