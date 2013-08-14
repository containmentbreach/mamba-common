angular.module('mamba', ['ngResource']).
	value('NOPHOTO_MEDIUM', '//images.mamba.ru/images/default/default/photo_big_na.gif').
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
					$rootScope.$apply(function () {
						that.unreg();
						if (callback) {
							callback(err, data);
						} else if (err) {
							throw err;
						}
					});
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
	}).run(function ($rootScope) {
		$rootScope.location = URI();
		$rootScope.locationQuery = $rootScope.location.query(true);
		$rootScope.oid = $rootScope.locationQuery.oid;
		$rootScope.extra = URI('?' + $rootScope.locationQuery.extra).search(true);
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
