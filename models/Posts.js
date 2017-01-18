/* populate database for tests :
curl --data "title=I'm a simple South African&url=http://img-9gag-fun.9cache.com/photo/a37g378_460s.jpg&nbpoints=5296&nbcomment=170" http://localhost:3000/posts
curl --data 'title=Do other countries have it?&url=http://img-9gag-fun.9cache.com/photo/a37Dgbv_460s.jpg&nbpoints=285&nbcomment=10' http://localhost:3000/posts
curl --data 'title=So I saw this post...&url=http://img-9gag-fun.9cache.com/photo/aMw6OjM_460s.jpg&nbpoints=3000&nbcomment=100' http://localhost:3000/posts
curl --data 'title=Power washed building in New York.&url=http://img-9gag-fun.9cache.com/photo/aERbB3M_460s.jpg&nbpoints=545&nbcomment=76' http://localhost:3000/posts
*/

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  	title: String,
  	url: String,
  	nbpoints: {type: Number, default: 0},
	nbcomment:  {type: Number, default: 0},
	bestcomments: Array
});

mongoose.model('Post', PostSchema);
