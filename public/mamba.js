angular.module('mamba', ['ngResource']).
	value('NOPHOTO_MEDIUM', '//images.mamba.ru/images/default/default/photo_big_na.gif').
	factory('Tim', function($resource) {
		var Tim = $resource('/tims/index.json', {}, {});
		// i 00 s 01 l 10 e 11
		// Tim.toSoc = function (id) {
		// 	var s = id >> 3;
		// 	var f1 = id & 4 ? 8 : 0;  // 01 00 0 : 00 00 0;   s : i
		// 	var f2 = id & 2 ? 6 : 4;  // 00 11 0 : 00 10 0;   e : l
		// 	s |= id & 1 ? f1 | f2 : f1 >> 2 | f2 << 2; // j
		// 	return s;
		// };
		// Tim.toId = function (s) {
		// 	var id = (s << 3 | s >> 4) & 9; // i | j
		// 	var f1 = s & 24; // 11 00 0
		// 	var f2 = s & 6;  // 00 11 0
		// 	if (f1 === 8 || f2 === 2) id |= 4;
		// 	if (f1 === 24 || f2 === 6) id |= 2;
		// 	return id;
		// };
		Tim.prototype.fullname = function () {
			return this.name + ' (' + this.mnemonic + ')';
		};
		return Tim;
	}).
	factory('Intertim', function($resource) {
		var Intertim = $resource('/intertims/index.json', {}, {});
		return Intertim;
	}).
	factory('PSType', function($resource) {
		var PSType = $resource('/pst/index.json', {}, {});
		PSType.prototype.fullname = function () {
			return this.name + ' (' + this.mnemonic + ')';
		};
		return PSType;
	}).
	factory('User', function($resource) {
		var User = $resource('/user', {}, {});
		return User;
	}).
	factory('SUser', function($resource, User, NOPHOTO_MEDIUM) {
		var SUser = $resource('/search', {}, {});
		SUser.prototype.isUser = function () {
			return (this.mamba && this.mamba.info) ? Boolean(this.mamba.info.is_app_user || this.tim) : 'wait';
		};
		SUser.prototype.mediumPhoto = function () {
			return this.mamba && this.mamba.info ?
				this.mamba.info.medium_photo_url || NOPHOTO_MEDIUM : undefined;
		};
		return SUser;
	}).
	factory('Test', function($resource) {
		return $resource('/tests/:id.json', {id: '@id'}, {});
	}).
	service('$indicator', function($rootScope) {
		$rootScope.nPendingReq = 0;

		this.reg = function() {
			$rootScope.nPendingReq++;
			$rootScope.indicatorVisible = true;
		};
		this.unreg = function() {
			$rootScope.nPendingReq--;
			$rootScope.indicatorVisible = $rootScope.nPendingReq > 0;
		};
		this.mamba = function(method, opts, callback) {
			opts = angular.copy(opts);
			opts.method = method;
			this.reg();
			var that = this;
			mamba.api(opts,
				function (err, data) {
					that.unreg();
					$rootScope.$digest();
					if (callback) {
						callback(err, data);
						$rootScope.$digest();
					} else if (err) {
						throw err;
					}
				});
		};
	}).
	config(function($routeProvider, $httpProvider) {
		$httpProvider.responseInterceptors.push(function($q, $indicator) {
			return function(promise) {
				$indicator.reg();
				return promise.then(
					function(response) {
						$indicator.unreg();
						return response;
					}, function(response) {
						$indicator.unreg();
						return $q.reject(response);
					});
			};
		});

		$routeProvider.
			when('/', {_tab: 'intro'}).
			when('/search', {controller: 'SearchCtrl', templateUrl: 'search.html',
				reloadOnSearch: false, _tab: 'search'}).
			when('/hits', {controller: 'HitsCtrl', templateUrl: 'userlist.html', _tab: 'hits'}).
			when('/contacts', {controller: 'ContactsCtrl', templateUrl: 'contacts.html',
				reloadOnSearch: false, _tab: 'contacts'}).
			when('/adm', {controller: 'AdmCtrl', templateUrl: 'adm.html', _tab: 'adm'}).
			when('/profile', {controller: 'ProfileCtrl', templateUrl: 'profile.html', _tab: 'profile'}).
			when('/tests/:test', {controller: 'TestCtrl', templateUrl: 'test.html', _tab: 'test'}).
			otherwise({redirectTo:'/'});
	}).run(function ($rootScope, $location) {
		$rootScope.extra = URI('?' + URI().search(true).extra).search(true);
	});

function reduceId(data) {
	return data.reduce(function(a, x) { a[x.id] = x; return a; }, {});
}

function findById(id, xx) {
	if (!xx) return undefined;
	for (var i = 0; i < xx.length; i++) {
		if (xx[i].id == id) return xx[i];
	}
	return undefined;
}
