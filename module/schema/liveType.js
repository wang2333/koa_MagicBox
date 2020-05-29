const mongoose = require('../db')
const Schema = mongoose.Schema
const LiveTypeSchema = new Schema({
  type: { type: String },
  value: { type: String },
})

module.exports = mongoose.model('LiveType', LiveTypeSchema)
