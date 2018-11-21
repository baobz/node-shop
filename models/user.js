var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {type: String, required: true},
  pwd: {type: String, required: true},
  create_time: {type: Date}
});

UserSchema
.virtual('url').get(function() {
  //登录成功获取_id
  console.log(this._id);
})

module.exports = mongoose.model('User', UserSchema);
