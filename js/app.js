var pf = angular.module('plantfactory', ['ui.bootstrap', 'mongolabResourceHttp', 'firebase']);
pf.constant('FirebaseUrl', 'https://ubuntu20.firebaseIO.com/plantfactory/0/')

pf.config(function ($routeProvider) {
		$routeProvider
			.when('/factory', {templateUrl:'/partials/index.html'})
			.when('/factory/check/add', {templateUrl:'/partials/check/form.html'})
			.when('/log', {templateUrl: '/partials/log/index.html', controller: 'LogCtrl'})
			.when('/camera', {templateUrl:'/partials/live/index.html', controller: 'CamCtrl'})
			.when('/issues', {templateUrl:'/partials/issues/index.html'})
			.when('/issues/add', {templateUrl: '/partials/issues/form.html'})
			.otherwise({redirectTo: '/factory'});
	});
pf.directive('upload', function () {
	return {
		link: function (scope, element, attrs) {
			element.bind('click', function () {
				filepicker.pick(function(InkBlob){
  				element.next().html(InkBlob.url);
  				scope[attrs.upload].url = InkBlob.url;
				});
			});
		}
	}
});
pf.controller('IndexCtrl', ['$scope', '$timeout', '$http', 'angularFire',
	function ($scope, $timeout, $http, angularFire) {
		$scope.check = {today: false, am: false, pm: false};
		var now = new Date()
			,	todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			, todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1)
			, midStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
		var ref = new Firebase('https://ubuntu20.firebaseIO.com/plantfactory/0/reports');
		
		var promise = angularFire(ref.limit(1), $scope, 'reports', []);
		promise.then(function () {
			var i = 0
			angular.forEach($scope.reports, function (obj, index) {
				if(i== 0) {
					$scope.report = obj;
					if(obj.time > midStart.getTime()) {
						$scope.check.am = false;
						$scope.check.pm = true;
						$scope.check.today = true;
					} else if (obj.time > todayStart.getTime()) {
						$scope.check.am =true;
						$scope.check.today = true;
					}
					$scope.checktime = new Date(obj.time);
				}
				i++;
			})
		});
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
			$scope.room1 = res.result[0]["121101001"];
			$scope.room2 = res.result[1]["121101002"];

		}
		xiancallback = function (res) {
			$scope.room3 = res.result[0]["121101003"];
		}	
		$scope.msg = '萵苣室　CO2在2013/10/02　15:10　異常';

		$http.jsonp('http://master.ubuntu20.tw/~yhsiang/pf/exhibit/index.php')
			.success(callback);
		$http.jsonp('http://master.ubuntu20.tw/~yhsiang/pf/exhibit/xian.php')
			.success(xiancallback);
		$scope.items = [];

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

pf.controller('LogCtrl', ['$scope', '$http',
	function ($scope, $http) {
		$scope.field = "co2";
		callback = function (res) {
			$scope.room1 = res.result[0]["121101001"];
			$scope.room2 = res.result[1]["121101002"];
			$scope.room = $scope.room1;
			$scope.chart = $scope.room1[0]["co2"];
			drawChart($scope.chart);
		}
		function getData(day) {
			$http.jsonp('http://master.ubuntu20.tw/~yhsiang/pf/exhibit/log.php', {params: {q: day}})
				.success(callback);
		}
		getData('day');
		function xAxisTitle (type) {
			switch(type) {
				case 'par': return '光合作用有效程度 (PAR)';
				case 'in': return '室溫 (\u2103)';
				case 'rh': return '相對濕度';
				case 'ph': return 'PH值';
				case 'ec': return '電導度';
				case 'water': return '水溫 (\u2103)';
				case 'co2': return 'CO2濃度';
			}
		}
		function  ydomain(type) {
			switch(type) {
				case 'par': return [0,450];
				case 'in': return [0,100];
				case 'rh': return [0,100];
				case 'ph': return [-4,10];
				case 'ec': return [0,10];
				case 'water': return [0,100];
				case 'co2': return [0,1000];
			};
		};
		$scope.show = function (day) {
			getData(day)
		}
		$scope.switchRoom = function (room) {
			$scope.room = (room == 'room2') ? $scope.room2 : $scope.room1;
			$scope.chart = $scope.room[0][$scope.field];
			drawChart($scope.chart);
		}
		$scope.switch = function (field) {
			$scope.field = field;
			$scope.chart = $scope.room[0][field];
			drawChart($scope.chart);
		}
		var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 680 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

  //var parseDate = d3.time.format("%d-%b-%y").parse;

  	var svg = d3.select(".historyChart").append('svg')
  	.attr("width", width + margin.left + margin.right)
  	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //d3.tsv("/data/data.tsv", function(error, data) {
  	var drawChart = function(data) {  
  		var x = d3.time.scale()
  		.range([0, width]);

  		var y = d3.scale.linear()
  		.domain(ydomain($scope.field))
  		.range([height, 0])

  		var xAxis = d3.svg.axis()
  		.scale(x)
  		.orient("bottom");

  		var yAxis = d3.svg.axis()
  		.scale(y)
  		.orient("left");

  		var line = d3.svg.line()
  		.x(function(d) { return x(d.Time); })
  		.y(function(d) { return y(d.Value); });


  		data.forEach(function(d) {
  			var t = d.Time.split(/[^0-9]/);
  			d.Time = new Date (t[0],t[1]-1,t[2],t[3],t[4],t[5] );
  			d.Value = +d.Value;
  		});
  		
  		x.domain(d3.extent(data, function(d) { return d.Time; }));
//    y.domain(d3.extent(data, function(d) { return d.Value; }));
			svg.selectAll("g").data([]).exit().remove()
			svg.selectAll("path").data([]).exit().remove()
			
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
       // .attr("transform", "rotate(-90)")
       .attr("x", 60+xAxisTitle($scope.field).length*10)
       .attr("y", -10)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text(xAxisTitle($scope.field));

      svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
     };

   }
   ]);
pf.controller('CamCtrl', ['$scope', 
	function ($scope) {
		
		getOne = function () {
			var camera1 = 'http://ubuntu20:camera@140.120.190.16/videostream.cgi?rate=0'
			$scope.camera = camera1;
			console.log(camera1)
		}

		getTwo = function () {
			var camera2 = 'http://ubuntu20:camera@140.120.190.16:81/cgi/jpg/image.cgi';
			console.log(camera2);
			$scope.camera = camera2;
		}
		$scope.switch = function (room) {
			if(room =='room1') getOne();
			else getTwo();
		}

		getOne();
	}
]);
pf.controller('AlbumCtrl', ['$scope', 'angularFireCollection',
	function ($scope, angularFireCollection) {
		var ref = new Firebase('https://ubuntu20.firebaseIO.com/plantfactory/0/issues');
		$scope.thumbs = angularFireCollection(ref);
		$scope.item =0;
		$scope.switch = function (index) {
			$scope.item = index;
		}
	}
]);
pf.controller('UploadCtrl', ['$scope', '$location', 
	function ($scope, $location) {
		$scope.file = {};
		var ref = new Firebase('https://ubuntu20.firebaseIO.com/plantfactory/0');
		$scope.add = function () {
			$scope.file.time = Firebase.ServerValue.TIMESTAMP;
			var fileref = ref.child('issues').push($scope.file);
			fileref.setPriority(Firebase.ServerValue.TIMESTAMP);
			$location.path("/issues");
		}
	}
]);