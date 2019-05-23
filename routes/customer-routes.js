const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const router = express.Router();

const Business = require('../models/business');
const Customer = require('../models/customer');
const Worker = require('./../models/worker');
const Promotion = require('./../models/promotion')

router.get('/', (req, res, next) => {
/* helpers validacion */
  Customer.findById(req.session.currentUser._id).populate('pinnedbusiness.businessID')
    .then(customer => {
      res.json(customer);
    })
    .catch(err => {
      res.json(err);
    })
});

// PUT update customer =============================================================

router.put('/update', (req, res, next)=>{
  /* form rellenado? */
   Customer.findByIdAndUpdate(req.session.currentUser._id, req.body, {new:true})
    .then((customer) => {
      req.session.currentUser = customer
      res.json({ message: `Customer with ${req.session.currentUser._id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    })

})

// PUT update wallet ========================================================

router.put('/wallet/update', (req, res, next)=>{

  /* const balanceFinal = req.session.currentUser.balance ... */

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
