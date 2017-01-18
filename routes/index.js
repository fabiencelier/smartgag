var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('../models/Posts');
var Post = mongoose.model('Post');
require('../models/userdata');
var Mypost = mongoose.model('userdata');

// Required for authentification
var passport = require('passport');
require('../models/Users');
var User = mongoose.model('User');
var jwt = require('express-jwt');

// Communication with python
var zerorpc = require("zerorpc");
var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

/*The userPropery option specifies which property on req to put our payload from our tokens. By default it's set on user but we're using payload instead to avoid any conflicts with passport (it shouldn't be an issue since we aren't using both methods of authentication in the same request). This also avoids confusion since the payload isn't an instance of our User model.
Make sure to use the same secret as the one in models/User.js for generating tokens. Again, we're hard-coding the token in this example but it is strongly recommended that you use an environment variable for referencing your secret. */
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
  	res.render('index', { title: 'SmartGag' });
});


// GET COMMENT/id
router.get('/comment/:id', function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
	console.log(req.params.id)
  	client.invoke("getCom",req.params.id, function(error, res2, more) {
    	//console.log(res2);
		res.json(res2);
	});
});

// GET POSTS
router.get('/posts', function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
  	Post.find(function(err, posts){
    	if(err){ return next(err); }
		//console.log(posts[0].bestcomments);
    	res.json(posts);
  	}).sort({"insert_date":-1}).limit(10);
});

// GET MYPOSTS
// Authentifaication required
router.get('/myposts', auth, function(req, res, next) {
	current_user = req.payload.username; // get username from auth system. 
	console.log("Post resquest from : "+current_user);
	req.headers['if-none-match'] = 'no-match-for-this';
  	Mypost.findOne({"name":current_user}, function(err, data){
    	if(err){ return next(err); }
		var posts=data.postlist;
		var alreadyread = [] // TODO: remove posts already sent
		posts.sort(function(a, b) { // sort by score
    		return b.score - a.score;
		});
		ids = posts.map(function(x){ return x.id; }).slice(0,10); // keep 10 first id
		Post.find({ _id: { $in: ids } }, function(err, myposts){ // request the ten corresponding posts
    		if(err){ return next(err); }
			myposts.sort((a, b) => ids.findIndex(id => a._id.equals(id)) - ids.findIndex(id => b._id.equals(id))); // sort by score
    		res.json(myposts);
  		});
  	});
});

// GET POSTS/SKIP/id
router.get('/posts/skip/:skip', function(req, res, next) {
	console.log(req.params.skip);
	myskip = Number(req.params.skip);
  	Post.find(function(err, posts){
    	if(err){ return next(err); }
    	res.json(posts);
  	}).sort({"insert_date":-1}).skip(myskip).limit(10);
});


// POST POSTS
router.post('/posts', auth,function(req, res, next) {
  var post = new Post(req.body);
  console.log(req.body);
  post.save(function(err, post){
    if(err){ return next(err); }
    res.json(post);
  });
});

// POST REGISTER
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)
  user.save(function (err){
    if(err){ return next(err); }
    return res.json({token: user.generateJWT()})
  });
});

// POST LOGIN
/*The passport.authenticate('local') middleware uses the LocalStrategy we created earlier. We're using a custom callback for the authenticate middleware so we can return error messages to the client. If authentication is successful we want to return a JWT token to the client just like our register route does.*/
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});


module.exports = router;
