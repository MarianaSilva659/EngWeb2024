const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var userSchema = new mongoose.Schema({
    _id: ObjectId,
    name: String,
    username: String,
    email: String,
    ucs: [String],
    dateCreated: String,
    lastAccess: String,
}, { versionKey: false });
  
module.exports = mongoose.model('user', userSchema, 'users')