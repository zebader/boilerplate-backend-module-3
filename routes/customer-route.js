const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();

const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');

const Customer = require('../models/customer');

router.get('/', isLoggedIn(), (req, res, next) => {

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }

  Customer.findById(req.session.currentUser._id).populate('pinnedbusiness.business')
    .then(customer => {
      res.json(customer);
    })
    .catch(err => {
      res.json(err);
    })
});

// PUT update customer =============================================================

router.put('/update', (req, res, next)=>{

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }
  /* Cuidado que el form puede no estar relleno user set */
   Customer.findByIdAndUpdate(req.session.currentUser._id, req.body, {new:true})
    .then((customer) => {
      req.session.currentUser = customer
      res.json(customer);
    })
    .catch(err => {
      res.json(err);
    })
})

// PUT update wallet ========================================================

router.put('/wallet/update', (req, res, next)=>{

  if(req.session.currentUser.userType !== "customer"){
    next(createError(401));
  }
  const balanceFinal = req.session.currentUser.balance + Number(req.body.balance)
  console.log(" body ",typeof balanceFinal, balanceFinal)

  Customer.findByIdAndUpdate(req.session.currentUser._id, {$set: {balance : balanceFinal}}, {new:true})
  .then((customer) => {
    req.session.currentUser = customer
    res.json({ message: `Balance with ${req.session.currentUser._id} is updated successfully.`, customer});
  })
  .catch(err => {
    res.json(err);
  })
})

module.exports = router;
