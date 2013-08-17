angular.module('mamba', ['ngResource']).
	value('NOPHOTO_MEDIUM', '//images.mamba.ru/images/default/default/photo_big_na.gif').
	service('$indicator', function($http) {
		this.nPending = 0;

		this.busy = function () {
			return this.nPending + $http.pendingRequests.length;
		};
		this.reg = function() {
			this.nPending++;
		};
		this.unreg = function() {
			this.nPending--;
		};
	}).
	service('$mamba', function($rootScope, $indicator) {
		this.api = function(method, opts, callback) {
			opts = angular.copy(opts);
			opts.method = method;
			$indicator.reg();
			var that = this;
			mamba.api(opts,
				function (err, data) {
					$rootScope.$apply(function () {
						$indicator.unreg();
						if (callback) {
							callback(err, data);
						} else if (err) {
							throw err;
						}
					});
				});
		};
	}).
	config(function($httpProvider) {
		$httpProvider.interceptors.push(function($q) {
			return {
				request: function(config) {
					if (config.params) {
						var range = config.params._range;
						delete config.params._range;
						if (range)
							config.headers['Range'] = 'items=' + range.start + '-' + range.end;
					}
					return config;
				},
				response: function(response) {
					var rng = response.headers('Content-Range');
					if (rng) {
						var m = rng.match(/^items=(\d+)-(\d+)\/(\d+)/);
						if (m) {
							var rng = {start: m[1], end: m[2], total: m[3]};
							var _h = response.headers;
							response.headers = function (h) {
								return h === '_range' ? rng : _h(h);
							};
						}
					}
					return response;
				}
			};
		});
	}).run(function ($rootScope, $indicator) {
		$rootScope.busy = angular.bind($indicator, $indicator.busy);

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
