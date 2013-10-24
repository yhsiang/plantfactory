var pf = angular.module('plantfactory', ['ui.bootstrap', 'mongolabResourceHttp', 'firebase']);
pf.constant('FirebaseUrl', 'https://ubuntu20.firebaseIO.com/plantfactory/0/')

pf.config(function ($routeProvider) {
		$routeProvider
			.when('/factory', {templateUrl:'/partials/index.html'})
			.when('/factory/check/add', {templateUrl:'/partials/check/form.html'})
			.when('/log', {templateUrl: '/partials/log/index.html'})
			.when('/camera', {templateUrl:'/partials/live/index.html', controller: 'CamCtrl'})
			.when('/issues', {templateUrl:'/partials/issues/index.html'})
			.otherwise({redirectTo: '/factory'});
	});

pf.controller('IndexCtrl', ['$scope', '$timeout', '$http', 'angularFire',
	function ($scope, $timeout, $http, angularFire) {
		var now = new Date()
			,	todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			, todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1)
			, startTime = todayStart.getTime()
			, endTime = todayEnd.getTime();
		//console.log(startTime);
		//console.log(endTime);
		var ref = new Firebase('https://ubuntu20.firebaseIO.com/plantfactory/0/reports');
		
		var promise = angularFire(ref.startAt(startTime), $scope, 'reports', []);
		promise.then(function () {
			var i = 0
			angular.forEach($scope.reports, function (obj, index) {
				if(i== 0) {
					$scope.report = obj;
					$scope.checktime = new Date(obj.time);
				}
				i++;
			})
		});
		//*/
		function updateTime () {
			$scope.now = new Date();
		}
		function updateLater() {
        // save the timeoutId for canceling
        timeoutId = $timeout(function() {
          updateTime(); // update DOM
          updateLater(); // schedule another update
        }, 1000);
    }
		callback = function (res) {
			console.log(res);
			$scope.room1 = res.result[0]["121101001"];
			$scope.room2 = res.result[1]["121101002"];
		}	
		$scope.msg = '萵苣室　CO2在2013/10/02　15:10　異常';

		$http.jsonp('http://master.ubuntu20.tw/~yhsiang/pf/exhibit/index.php')
			.success(callback);
/*
		$scope.blocks = [ { name: 'CO2', class: 'co2', value: 800}
										, { name: '水溫', class: 'water', value: 23}
										, { name: '室溫', class: 'in', value: 28}
										, { name: '濕度', class: 'rh',value: '58%'}
										, { name: '光照', class: 'par',value: 400}
										, { name: 'PH', class: 'ph',value: 6.5}
										, { name: 'EC', class: 'ec',value: 2.3}];
//*/
		$scope.items = [];
/*
		$scope.items = [ { name: '電量', class: 'elecharge', value: 800}
										, { name: '水量', class: 'watercharge', value: 23}
										, { name: '純水濾芯', class: 'waterfilter', value: '正常'}
										, { name: '儲水量', class: 'waterstorage',value: '正常'}
										, { name: '微霧機', class: 'mistmachine',value: '正常'}
										, { name: '壓力', class: 'pressure',value: '正常'}
										, { name: 'CO2機器', class: 'co2device',value: '正常'}
										, { name: '加壓幫浦', class: 'pressurepumps',value: '正常'}
										, { name: '抽水幫浦', class: 'waterpumps',value: '正常'}
										, { name: '空調', class: 'aircondition',value: '正常'}
										, { name: 'LED', class: 'led',value: '正常'}
										, { name: '氣霧系統', class: 'spraydevice',value: '正常'}
										, { name: '廢液回收', class: 'waterrecycle',value: '正常'}
										, { name: '環境維護', class: 'environment',value: '正常'}
										];
//*/
		$scope.pos = function (index) {
			if(index%7 == 0) return 'first';
			if(index%7 == 6) return 'last';
		}
		updateLater();
	}
]);

pf.controller('FormCtrl',['$scope', '$location', 'angularFire',
	function ($scope, $location, angularFire) {
		var ref = new Firebase('https://ubuntu20.firebaseIO.com/plantfactory/0');
		//var promise = angularFire(ref.child('reports'), $scope, 'reports', []);
		$scope.init = function () {
			var report = { 
				elecharge: 0,
				watercharge: 0,
				waterfilter: {status: true, problem: ''},
				waterstorage: {status: true, problem: ''},
				mistmachine: {status: true, problem: ''},
				pressure: {status: true, problem: ''},
				co2device: {status: true, problem: ''},
				pressurepumps: {status: true, problem: ''},
				waterpumps: {status: true, problem: ''},
				aircondition: {status: true, problem: ''},
				led: {status: true, problem: ''},
				spraydevice: {status: true, problem: ''},
				waterrecycle: {status: true, problem: ''},
				environment: {status: true, problem: ''}
			};
			$scope.report = report;
		}
	 	//$scope.reports = angularFireCollection(ref);
		$scope.add = function () {
			$scope.report.time = Firebase.ServerValue.TIMESTAMP;
			var reportref = ref.child('reports').push($scope.report);
			reportref.setPriority(Firebase.ServerValue.TIMESTAMP);
			$location.path("/factory");
		}
	}
]);

pf.controller('LogCtrl', ['$scope',
	function ($scope) {
		$scope.blocks = [ { name: 'CO2', class: 'co2', value: 800}
		, { name: '水溫', class: 'water', value: 23}
		, { name: '室溫', class: 'in', value: 28}
		, { name: '濕度', class: 'rh',value: '58%'}
		, { name: '光照', class: 'par',value: 400}
		, { name: 'PH', class: 'ph',value: 6.5}
		, { name: 'EC', class: 'ec',value: 2.3}];
	}
]);
pf.controller('CamCtrl', ['$scope', 
	function ($scope) {
		
		getOne = function () {
			var camera1 = 'http://ubuntu20:camera@140.120.190.16/videostream.cgi?rate=0'
			$scope.camera = camera1;
		}

		getTwo = function () {
			var camera2 = 'http://ubuntu20:camera@140.120.190.16:81/cgi/jpg/image.cgi';
			$scope.camera = camera2;
		}
		$scope.switch = function (room) {
			if(room =='room1') getOne();
			else getTwo();
		}

		getOne();
	}
]);