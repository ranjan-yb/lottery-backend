const mongoose = require('mongoose')


const manuplatebigsmallResults = new mongoose.Schema({
    manuplatebigsmallResult: {
     type: String,
     default: ""
    }
});

module.exports = mongoose.model('ManuplateResultBigSmall',manuplatebigsmallResults )