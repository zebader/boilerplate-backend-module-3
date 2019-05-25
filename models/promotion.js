const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    name: { type:String, required:true },
    imgUrl: { type: String, default: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/infinity-stones-style-3-cole-iba.jpg'},
    type: String,
    pointsToUnlock: { type:Number, required:true, min: 0 },
    userID:  [{type: Schema.Types.ObjectId, ref: 'Customer'}],
    qrCode: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;


