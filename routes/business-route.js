const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();

const Business = require('../models/business');
const Customer = require('../models/customer');
const Worker = require('./../models/worker');
const Promotion = require('./../models/promotion')

router.get('/', (req, res, next) => {

  Business.findById(req.session.currentUser._id).populate('workers').populate('promotions')
    .then(business => {
      res.json(business);
    })
    .catch(err => {
      res.json(err);
    })
});


// POST add worker =============================================================

router.post('/workers/add', (req, res, next) => {
  const { name, type } = req.body;
  const businessId = req.session.currentUser._id

  Business.findById(req.session.currentUser._id).populate('workers')
  .then((business)=>{

    let workerExists = false;
    business.workers.forEach((elem)=>{
      if (elem.name === name) return workerExists = true
    })

    if (!workerExists){
      Worker.create({ name, type })
      .then((newWorker)=>{

        Business.findByIdAndUpdate( businessId, { $push:{ workers: newWorker } })
        .then((theResponse) => {
          res.status(201).json(theResponse);
        })
        .catch(err => {
          res.status(500).json(err);
      })
        res.json({message:"worker added"}).status(202)
      }).catch((err)=>{
        next(err)
      })
    }else{
      return next(createError(422));
    }
  }).catch((err)=>{
    next(err)
  })
});

// GET worker details =============================================================

router.get('/workers/:id', (req, res) => {
  const { id } = req.params;

  if ( !mongoose.Types.ObjectId.isValid(id)) {
    res
      .status(400)  //  Bad Request
      .json({ message: 'Specified id is not valid'})
    return;
  }

  Worker.findById( id )
    .then( (foundWorker) => {
      console.log("worker id ", foundWorker)
      res.status(200).json(foundWorker);
    })
    .catch((err) => {
      res.res.status(500).json(err);
    })
  });

// PUT update worker =============================================================

router.put('/workers/:id/update', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Worker.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: `Worker with ${req.params.id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

// DELETE delete worker =============================================================

router.delete('/workers/:id/delete', (req, res, next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Worker.findByIdAndRemove(req.params.id)
    .then(() => {
      res.json({ message: `Worker with ${req.params.id} is been deleted successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

// POST add promotion =============================================================

router.post('/promotions/add', (req, res, next) => {
  const { name, type, pointsToUnlock } = req.body;
  const businessId = req.session.currentUser._id

  Business.findById(req.session.currentUser._id).populate('promotions')
  .then((business)=>{

    let promotionExists = false;
    business.promotions.forEach((elem)=>{
      if (elem.pointsToUnlock === pointsToUnlock) return promotionExists = true
    })

    if (!promotionExists){
      Promotion.create({ name, type, pointsToUnlock })
      .then((newPromotion)=>{

        Business.findByIdAndUpdate( businessId, { $push:{ promotions: newPromotion } })
        .then((theResponse) => {
          res.status(201).json(theResponse);
        })
        .catch(err => {
          res.status(500).json(err);
      })

        res.json({message:"promotion added"}).status(202)
      }).catch((err)=>{
        next(err)
      })
    }else{
      return next(createError(422));
    }
  }).catch((err)=>{
    next(err)
  })
});

module.exports = router;