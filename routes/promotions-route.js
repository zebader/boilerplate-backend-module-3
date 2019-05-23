const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();

const Business = require('../models/business');
const Customer = require('../models/customer');
const Worker = require('./../models/worker');
const Promotion = require('./../models/promotion')

// GET business with promotion =============================================================

router.get('/', (req, res, next) => {

  Business.find().populate('workers').populate('promotions')
    .then(business => {
      res.json(business);
    })
    .catch(err => {
      res.json(err);
    })
});

// GET promotion details (business and customer)=============================================================

router.get('/:id', (req, res) => {
  const { id } = req.params;

  if ( !mongoose.Types.ObjectId.isValid(id)) {
    res
      .status(400)  //  Bad Request
      .json({ message: 'Specified id is not valid'})
    return;
  }

  Business.findById( id ).populate('workers').populate('promotions')
    .then( (foundBusiness) => {
      res.status(200).json(foundBusiness);
    })
    .catch((err) => {
      res.res.status(500).json(err);
    })

  });

// GET worker details =============================================================

router.get('/:id/:workedId', (req, res) => {
  const { workerId } = req.params;

  if ( !mongoose.Types.ObjectId.isValid(id)) {
    res
      .status(400)  //  Bad Request
      .json({ message: 'Specified id is not valid'})
    return;
  }

  Worker.findById( workerId )
    .then( (foundWorker) => {
      res.status(200).json(foundWorker);
    })
    .catch((err) => {
      res.res.status(500).json(err);
    })

  });

// PUT update worker =============================================================

router.put('/:id/:workerdId/rate', (req, res, next)=>{


  // sumar tips

  // media rating


  if(!mongoose.Types.ObjectId.isValid(req.params.workerId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  /* validar q es un customer y no un business  */

   Worker.findByIdAndUpdate(req.params.workerId, req.body)
    .then(() => {

      Customer.findByIdAndUpdate(req.session.currentUser._id, {$push: {'pinnedbusiness.business':req.params.id, 'pinnedbuisenss.points': req.body }})
      .then(()=>{
        res.json({ message: `Customer with ${req.params.workerId} is updated successfully.` });

      })
    })
    .catch(err => {
      res.json(err);
    })

})

// GET promotion details =============================================================

router.get('/:id/:promoId', (req, res) => {


  if ( !mongoose.Types.ObjectId.isValid(id)) {
    res
      .status(400)  //  Bad Request
      .json({ message: 'Specified id is not valid'})
    return;
  }

  Promotion.findById( req.params.promoId )
    .then( (foundPromotion) => {
      res.status(200).json(foundPromotion);
    })
    .catch((err) => {
      res.res.status(500).json(err);
    })

  });

// PUT insert user in business =============================================================

router.put('/:id/:promoId/update', (req, res, next) => {

  Promotion.findByIdAndUpdate(req.params.promoId,{$push:{userId:req.session.currentUser._id}}).populate('userID')
  .then((promotion)=>{
    res.json({ message: `Customer with ${req.params.workerId} is updated successfully.` });
  }).catch((err)=>{
    next(err)
  })
});

module.exports = router;
