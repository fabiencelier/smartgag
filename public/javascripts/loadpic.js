var app = angular.module('LoadPicture', ['ui.router','angular-inview','ngSanitize']); //,'angular-inview'

app.factory('posts', ['$http', 'auth', 'coms', function($http,auth, coms){
	var o = {
		posts: [],
		count: 0
	};
	function GetCom(post_id,ind){
    // RETURN the promise
		return $http.get('/comment/'+post_id).then(function(response){
			coms = (angular.copy(response.data));
			return [ind,coms];
		});
	};
	o.getAll = function() {
    	$http.get('/myposts/', {
    	headers: {Authorization: 'Bearer '+auth.getToken()}
  		}).success(function(data){
			for (var i = 0; i < data.length; i++) {
				mypost = angular.copy(data[i]);
				o.posts.push(mypost);
				ind = o.posts.indexOf(mypost);
				GetCom(mypost.post_id,ind).then(function(response){
						o.posts[response[0]].bestcomments = o.posts[response[0]].bestcomments.concat(response[1]);
				});
			};
    	});
  	};
	o.getMore = function(skip) {
    	return $http.get('/posts/skip/'+o.count).success(function(data){
			for (var i = 0; i < data.length; i++) {
				mypost = angular.copy(data[i]);
				o.posts.push(mypost);
				ind = o.posts.indexOf(mypost);
				GetCom(mypost.post_id,ind).then(function(response){
						o.posts[response[0]].bestcomments= o.posts[response[0]].bestcomments.concat(response[1]);
				});
			}
			o.count+=10;
    	});
	};
  	return o;
}]);


app.factory('coms', [function(){
	var o = {
		comments: []
	};
	o.init = function(name) {
		o.comments[name]=[{bind:"working"}];
	}
  	return o;
}]);

app.factory('tools', [function(){
	var o = {};
	o.getBottom = function(el) {
		var rect = el[0].getBoundingClientRect();
		return parseInt(rect.bottom);
	}
  	return o;
}]);



app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};
	auth.saveToken = function (token){ // save token to local storage
  		$window.localStorage['flapper-news-token'] = token;
	};
	auth.getToken = function (){ // get token from local storage
  		return $window.localStorage['flapper-news-token'];
	}
	auth.isLoggedIn = function(){ //  return a boolean value for if the user is logged in. 
	  	var token = auth.getToken();
	  	if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
	  	}
	};
	auth.currentUser = function(){  // eturns the username of the user that's logged in. 
	  		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
  		}
	};
	auth.register = function(user){  // a register function that posts a user to our /register route and saves the token returned.
  		return $http.post('/register', user).success(function(data){
    		auth.saveToken(data.token);
  		});
	};
	auth.logIn = function(user){  // a login function that posts a user to our /login route and saves the token returned. 
  		return $http.post('/login', user).success(function(data){
    		auth.saveToken(data.token);
  		});
	};
	auth.logOut = function(){ // a logout function that removes the user's token from localStorage, logging the user out. 
  		$window.localStorage.removeItem('flapper-news-token');
	};
	return auth;
}])

app.directive('dynamicUrl', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attr) {
            element.attr('src', attr.dynamicUrlSrc);
        }
    };
});

app.directive('checkHeight', ['tools', '$timeout', function (tools, $timeout) {
    return {
		restrict: 'A',
        link: function changeNgIf(scope, element, attr) {
			var bot = tools.getBottom(element);
			var blockleft= element.parent().parent().parent().parent().children(':first').children(':first').children(':first');
			var commentBlock = element.parent().parent()
			scope.localshow=true;
			var bot2 = tools.getBottom(blockleft);
			commentBlock.css('height', blockleft[0].offsetHeight+'px');
			//scope.sizer = bot+" "+bot2;
			if (parseInt(bot)>bot2) { 
				scope.localshow=false;
			};
        }
    };
}]);


app.directive('removeemptyimg', ['tools', '$timeout', function (tools, $timeout) {
    return {
		restrict: 'A',
        link: function showhide(scope, element, attr) {
			if ( attr["src"] ) { 
				scope.showtxt = false;
			};
			console.log(scope.showtxt);
        }
    };
}]);

app.controller('postsCtrl', [
	'$scope',
	'$http',
	'posts',
	'auth',
	function($scope, $http, posts, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.posts = posts.posts;
		$scope.currentUser = auth.currentUser;
		$scope.now = Date.now();
		$scope.getAge = function(timestamp){
			var age=Math.floor(Date.now() / 1000) -parseInt(timestamp);
			var numdays = Math.floor(age  / 86400); 
			if (numdays>7) {return (new Date).toLocaleFormat("%A, %B %e, %Y");};
			if (numdays>0) {return numdays+'d';};
			var numhours = Math.floor(((age % 31536000) % 86400) / 3600);
			if (numhours>0) {return numhours+'h';};
			var numminutes = Math.floor((((age % 31536000) % 86400) % 3600) / 60);
			if (numminutes>0) {return numminutes+'m';};
			var numseconds = (((age % 31536000) % 86400) % 3600) % 60;
			return numseconds+'s';
		}
		$scope.myLoadingFunction = function(){
			posts.getMore(10);	
			/*$scope.posts.push({
    			title: "Load more",
    			url: 'http://img-9gag-fun.9cache.com/photo/a37Dgbv_460s.jpg',
    			nbpoints: 254,
				nbcomments: 5
  			});*/
		}
}]); 

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	  	$stateProvider
			.state('home', {
		  		url: '/home',
		  		templateUrl: '/home.html',
		  		controller: 'postsCtrl'
			})
			.state('hot', {
				url: '/hot',
	  			templateUrl: '/hot.html',
	  			controller: 'postsCtrl',
				resolve: {
					postPromise: ['posts', function(posts){
		  				return posts.getAll();
	   				}]
	  			}
			})
			.state('trending', {
				url: '/trending',
				templateUrl: '/trending.html',
				controller: 'postsCtrl',
			})
			.state('login', {
	  			url: '/login',
				templateUrl: '/login.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn()){
		  				$state.go('home');
					}
	  			}]
			})
			.state('register', {
				url: '/register',
				templateUrl: '/register.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn()){
		  				$state.go('home');
					}
	  			}]
			});
	 	$urlRouterProvider.otherwise('home');
}]);

// authentication controller
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		$scope.user = {}; // We need to initialize a user on $scope for our form
		$scope.register = function(){
			auth.register($scope.user).error(function(error){
			  	$scope.error = error;
			}).then(function(){
			  	$state.go('home');
			});
	  	};

	  	$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
		  		$scope.error = error;
			}).then(function(){
		  		$state.go('home');
			});
	  	};
}]);

// NAVBAR controller
app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
	  	$scope.isLoggedIn = auth.isLoggedIn;
	  	$scope.currentUser = auth.currentUser;
	  	$scope.logOut = auth.logOut;
}]);

app.controller('HotCtrl', [
	'$scope',
	'$stateParams',
	'posts',
	function($scope, $stateParams, posts){
}]);

