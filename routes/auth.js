const express = require('express');
const createError = require('http-errors');

const router = express.Router();
const bcrypt = require('bcrypt');

const Business = require('../models/business');
const Customer = require('../models/customer');

const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');

router.get('/me', isLoggedIn(), (req, res, next) => {
 
 if(req.session.currentUser.userType){

  Business.findById(req.session.currentUser._id).populate('workers').populate('promotions')
  .then(business => {
    req.session.currentUser = business
    res.json(req.session.currentUser);
  })
  .catch(err => {
    res.json(err);})
    return
 }
 Customer.findById(req.session.currentUser._id).populate('pinnedbusiness.businessID')
 .then(customer => {
   req.session.currentUser = customer
   res.json(req.session.currentUser);
 })
 .catch(err => {
   res.json(err);
 })

});

router.post(
  '/login',
  isNotLoggedIn(),
  validationLoggin(),
  async (req, res, next) => {
    const { username, password , userType } = req.body;
    if (userType === "business"){
      try {
        const user = await Business.findOne({ username });
        if (!user) {
          next(createError(404));
        } else if (bcrypt.compareSync(password, user.password)) {
          req.session.currentUser = user;
          return res.status(200).json(user);
        } else {
          next(createError(401));
        }
      } catch (error) {
        next(error);
      }
      return
    }

    try {
      const user = await Customer.findOne({ username });
      if (!user) {
        next(createError(404));
      } else if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.status(200).json(user);
      } else {
        next(createError(401));
      }
    } catch (error) {
      next(error);
    }
    },
);

router.post(
  '/signup',
  isNotLoggedIn(),
  validationLoggin(),
  async (req, res, next) => {
    const { username, password, email, location, userType } = req.body;

    if (userType === "business"){
      try {
      const user = await Business.findOne({ username }, 'username');
      if (user) {
        return next(createError(422));
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);
        const newUser = await Business.create({ username, password: hashPass, email, location });
        req.session.currentUser = newUser;
        res.status(200).json(newUser);
      }
    } catch (error) {
      next(error);
    }
    return
  }

    try {
      const user = await Customer.findOne({ username }, 'username');
      if (user) {
        return next(createError(422));
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);
        const newUser = await Customer.create({ username, password: hashPass, email, location });
        req.session.currentUser = newUser;
        res.status(200).json(newUser);
      }
    } catch (error) {
      next(error);
    }
  },
);

router.post('/logout', isLoggedIn(), (req, res, next) => {
  req.session.destroy();
  return res.status(204).send();
});

router.get('/private', isLoggedIn(), (req, res, next) => {
  res.status(200).json({
    message: 'This is a private message',
  });
});

module.exports = router;
