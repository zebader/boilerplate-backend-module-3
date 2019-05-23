const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
  username: { type:String, required:true },
  password: { type:String,  required:true },
  email: { type:String, required:true, unique:true}, 
  location: { type:String, required:true},
  userType: { type: String, default: 'business'},
  imgUrl:  {type: String, default: 'https://www.cinematographe.it/wp-content/uploads/2016/03/grootsupper1.jpg' },
  workers: [{type: Schema.Types.ObjectId, ref: 'Worker'}],
  promotions: [{type: Schema.Types.ObjectId, ref: 'Promotion'}]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});

/* --------------------------backlog
pointsFactor - Number
benefits - Number
totalPoints - Number
spotlighted - Boolean
businessType - String
mapLocation - String 
--------------------------backlog*/

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;


