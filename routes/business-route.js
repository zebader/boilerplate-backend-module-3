const express = require('express');
const createError = require('http-errors');

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
