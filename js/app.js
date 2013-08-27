var pf = angular.module('plantfactory', ['ui.bootstrap', 'mongolabResourceHttp']);
pf.constant('MONGOLAB_CONFIG', {API_KEY: 'QeQxSXIoW4PVJtNjs0QPza89NVRHjVrS',DB_NAME:'plantfactory'});
pf.config(function ($routeProvider) {
		$routeProvider
			.when('/room', {controller: RoomCtrl, templateUrl:'/partials/rooms.html'})
			.when('/:room/sheives', {controller: ShelfCtrl , templateUrl:'/partials/sheives.html'})
			.when('/:room/:shelf/:level/box', {controller: BoxCtrl, templateUrl:'/partials/boxes.html'})
			.when('/:room/:shelf/:level/:box', {controller: PlantCtrl, templateUrl:'/partials/box.html'})
			.when('/order/plant', {controller: OrderCtrl, templateUrl: '/partials/order.html'})
			.otherwise({redirectTo: '/room'});
	});

pf.factory('Room', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('rooms');
});

pf.factory('Shelf', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('sheives');
});

pf.factory('Level', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('levels');
});

pf.factory('Box', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('boxes');
});

function RoomCtrl ($scope, Room, $timeout) {
  
  function load () {
  	Room.all(function (rooms) {
  		$scope.rooms = rooms;
  	});
	}
	load();
  $scope.plus = function () {
  	var room = new Room();
  	room.name = window.prompt("請輸入栽培室名稱", "新栽培室");
  	room.$save();
  	$timeout(load, 500);
  }
}

function ShelfCtrl ($scope, $routeParams, Room, Shelf, $timeout, Level) {
	function load () {
		$scope.room = Room.getById($routeParams.room);
  	Shelf.query({room: $routeParams.room}, function (sheives){
  		$scope.sheives = sheives;
  		angular.forEach(sheives, function (item, idx) {
  			Level.query({shelf: item.name, room: item.room}, {sort: {pos: -1}},function (levels) {
  				$scope.levels = levels;
  				console.log(levels);
  			});
  		});
  	});
	}
	load();
	makeLevel = function (shelf, obj) {
		lv = angular.extend(new Level(), obj);
		lv.shelf = shelf.name;
		lv.room = shelf.room;
		lv.$save();
	}
	$scope.plus = function () {
		var shelf = new Shelf();
		shelf.name = "第"+($scope	.sheives.length+1)+"栽培架";
		shelf.room = $routeParams.room;
		makeLevel(shelf, {name: "上", pos:"up"});
		makeLevel(shelf, {name: "中", pos:"middle"});
		makeLevel(shelf, {name: "下", pos:"down"});
		shelf.$save();
		$timeout(load, 500);
	}
}

function BoxCtrl ($scope, $routeParams, Room, Shelf, Level, Box, $timeout) {
	function load () {
		criteria = {room: $routeParams.room, shelf: $scope.shelf.name, level: $routeParams.level};
		$scope.boxes = Box.query(criteria);
	}
	$scope.room = Room.getById($routeParams.room);
	Shelf.getById($routeParams.shelf, function (shelf) {
		$scope.shelf = shelf;
		Level.query({room: $routeParams.room, shelf: shelf.name, pos: $routeParams.level},
			function (level) {
				$scope.level = level[0];
				load();
			});
	});


	$scope.plus = function () {
		if($scope.boxes.$$v.length < 9) {
			var box = new Box()
				,	i = $scope.boxes.$$v.length || 0;
			box.name = "栽培箱"+(i+1);
			box.shelf = $scope.shelf.name;
			box.room = $routeParams.room;
			box.level = $routeParams.level;
			box.$save(function (box) {
				$timeout( function(){ $scope.boxes.$$v.push(box)}, 500);
			});
		}	else {
			alert('栽培箱不可超過9個');
		}
	};
}

function PlantCtrl ($scope, $routeParams) {
	$scope.room = $routeParams.room;
	$scope.shelf = $routeParams.shelf;
	$scope.level = $routeParams.level;
	$scope.box = $routeParams.box;
	$scope.plants = [
		{ name: "萵苣"},
		{ name: "萵苣"},
		{ name: "萵苣"},
		{ name: "萵苣"},
		{ name: "萵苣"},		
		{ name: "萵苣"},
		{ name: "萵苣"},
		{ name: "萵苣"},
		{ name: "萵苣"}				
	];
}

function OrderCtrl ($scope) {
	$scope.factories = [
		{ name: "中興大學" , plants: [
			{ name: "萵苣", amount: 12},
			{ name: "火焰菜", amount: 9},
			{ name: "草莓", amount: 7}	
		]},
		{ name: "育成中心" , plants: [
			{ name: "咖啡豆", amount: 6},
			{ name: "芝麻菜", amount: 7},
			{ name: "冰花", amount: 8}	
		]}
	];
}
