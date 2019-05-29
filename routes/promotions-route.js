const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');

const Business = require('../models/business');
const Customer = require('../models/customer');
const Worker = require('./../models/worker');
const Promotion = require('./../models/promotion')

// GET business with promotion =============================================================

router.get('/', isLoggedIn(), (req, res, next) => {

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

  Business.find().populate('workers').populate('promotions')
    .then(business => {
      res.json(business);
    })
    .catch(err => {
      res.json(err);
    })
});

// GET promotion details (business and customer)=============================================================

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

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

router.get('/:id/workers/:workerId', (req, res, next) => {

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }
  const { workerId } = req.params;

  if ( !mongoose.Types.ObjectId.isValid(req.params.id)) {
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

// PUT update worker rate and tip =============================================================

router.put('/:id/workers/:workerId/rate', (req, res, next)=>{

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

  if(!mongoose.Types.ObjectId.isValid(req.params.workerId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
  Worker.findById(req.params.workerId)
  .then((worker)=>{

    const tipsFinal = worker.tips + Number(req.body.tips)
    if(worker.rating === 0 && req.body.rating !== 0) {worker.rating = 5}
    const ratingFinal = Math.round((worker.rating + Number(req.body.rating))/2)    
    
    Worker.findByIdAndUpdate(req.params.workerId, {$set: {tips : tipsFinal , rating:ratingFinal}}, {new:true})
    .then(() => {  
    
      const newBusiness = { business: req.params.id, points: Number(req.body.points) }
      
      const businessId = mongoose.Types.ObjectId(req.params.id)

      Customer.find({ _id:req.session.currentUser._id, 'pinnedbusiness.business':businessId})
      .then((customer)=>{

        if(customer.length !== 0){
            let balanceFinal = customer[0].balance - Number(req.body.tips)
            let newPoints = 0;
            
            customer[0].pinnedbusiness.forEach((elem)=>{
              if(elem.business.equals(req.params.id)){
                newPoints = elem.points + newBusiness.points
              } 
            })
       
            Customer.findOneAndUpdate({_id:req.session.currentUser._id, 'pinnedbusiness.business':req.params.id},
            {$set: {'pinnedbusiness.$.points': newPoints }, balance:balanceFinal },
            {new: true}).populate('pinnedbusiness.business')
            .then((customer)=>{

              req.session.currentUser = customer
              res.json({ message: `Worker with ${req.params.workerId} is been tip and rated.`, customer });
            }).catch(err => {
              res.json(err);})
              
            } else {
              
              Customer.findOneAndUpdate({_id:req.session.currentUser._id},
                {$push: {pinnedbusiness: newBusiness }},
                {new: true}).populate('pinnedbusiness.business')
                .then((customer)=>{

                  let balanceFinal = customer.balance - Number(req.body.tips)

              req.session.currentUser = customer
              res.json({ message: `Worker with ${req.params.workerId} is been tip and rated.`, customer });

                  Customer.findOneAndUpdate({_id:req.session.currentUser._id},
                  {$set: {balance:balanceFinal} },
                  {new: true}).populate('pinnedbusiness.business')
                  .then((customer)=>{

                      req.session.currentUser = customer
                      res.json({ message: `Worker with ${req.params.workerId} is been tip and rated.`, customer });

                }).catch(err => {
                    res.json(err);
                  })
            }).catch(err => {
              res.json(err);
            })
            }
        })
        .catch(err => {
        res.json(err);
        })

    }).catch(err => {
      res.json(err);})

  }).catch(err => {
      res.json(err);
    
    })
  })

// GET promotion details =============================================================

router.get('/:id/promotions/:promoId', (req, res, next) => {

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

  if ( !mongoose.Types.ObjectId.isValid(req.params.id)) {
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

// PUT insert user in promotion =============================================================

router.put('/:id/promotions/:promoId/rate', (req, res, next) => {

  console.log(req.session.currentUser._id)

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

  Promotion.findByIdAndUpdate(req.params.promoId,{ $push: {userID:req.session.currentUser._id}}, {new:true}).populate('userID')
  .then((promotion)=>{
    res.json({ message: `Promotion with ${req.params.promoId} is updated successfully.`, promotion });
  }).catch((err)=>{
    next(err)
  })
});

module.exports = router;
