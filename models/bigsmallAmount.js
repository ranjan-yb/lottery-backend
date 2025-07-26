const mongoose = require('mongoose');

const bigsmallAmount = new mongoose.Schema({
    bigAmount: {
        type: Number,
        default: 0
    },

      smallAmount: {
        type: Number,
        default: 0
    },

   userbigsmallCount: {
    type: Array,
    default: []
   }


});

module.exports = mongoose.model('bigsmallAmount', bigsmallAmount);