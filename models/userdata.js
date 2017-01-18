var mongoose = require('mongoose');
	Schema = mongoose.Schema;
	ObjectId = mongoose.Schema.Types.ObjectId;


var postdata = new Schema({
  	id: {type: ObjectId, ref: 'Post'},
	address: {type: String, default: ""},
  	score: {type: Number, default: -1},
});

var MypostSchema = new Schema({
  	name: String,
  	gagid: {type: String, default: ""},
  	linked: {type: Number, default: 0},
	postlist: [postdata]
});

mongoose.model('userdata', MypostSchema);
