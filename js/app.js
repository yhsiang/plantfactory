var pf = angular.module('plantfactory', ['ui.bootstrap', 'mongolabResourceHttp']);
pf.constant('MONGOLAB_CONFIG', {API_KEY: 'QeQxSXIoW4PVJtNjs0QPza89NVRHjVrS',DB_NAME:'plantfactory'});
pf.config(function ($routeProvider) {
		$routeProvider
			.when('/room', {controller: RoomCtrl, templateUrl:'/partials/rooms.html'})
			.when('/:room/sheives', {controller: ShelfCtrl , templateUrl:'/partials/sheives.html'})
			.when('/:room/:shelf/:level/boxes', {controller: BoxCtrl, templateUrl:'/partials/boxes.html'})
			.when('/:room/:shelf/:level/:box', {controller: PlantCtrl, templateUrl:'/partials/box.html'})
			.when('/order/plant', {controller: OrderCtrl, templateUrl: '/partials/order.html'})
			.when('/live', {templateUrl: '/partials/live.html'})
			.when('/list', {templateUrl: '/partials/list.html'})
			.otherwise({redirectTo: '/room'});
	});

pf.factory('Room', function ($mongolabResourceHttp) {

	return $mongolabResourceHttp('rooms');
});
pf.factory('Shelf', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('sheives');
});

pf.factory('Level', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('level');
});
pf.factory('Box', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('boxes');
});
pf.factory('Plant', function ($mongolabResourceHttp) {
	return $mongolabResourceHttp('plants');
});

function listCtrl ($scope, Plant, Box, Level, Shelf) {
	Box.all()
		.then(function (boxes) {
			angular.forEach (boxes, function (item) {
				Shelf.query({id: item.shelf})
					.then( function (shelf) {
						item.room = shelf.room;
					})
				Plant.count({box: item.id})
					.then(function (amount) {
						item.plants = amount;
					});
			})
			$scope.boxes = boxes;

		});
}
function BreadcrumbCtrl ($scope, $routeParams, Room, Shelf, Level, Box) {
	if($routeParams.room)
	Room.query({id: $routeParams.room}, function (room) {
		$scope.room = room[0];
	});
	if($routeParams.shelf)
		Shelf.query({id: $routeParams.shelf}, function (shelf) {
			$scope.shelf = shelf[0];
		});
	if($routeParams.level)
		Level.query({id: $routeParams.level}, function (level) {
			$scope.level = level[0];
		});
	if($routeParams.box) 
		Box.query({id: $routeParams.box}, function (box) {
			$scope.box = box[0];
		});
}
function RoomCtrl ($scope, $timeout, Room) {
  
  Room.all(function (rooms) {
  	$scope.rooms = rooms;
  });
	
  $scope.plus = function () {
  	if($scope.rooms.length < 2) {
	  	var room = new Room();
	  	room.name = window.prompt("請輸入栽培室名稱", "新栽培室");
	  	room.id = Math.uuid(2,10);	  	
	  	if(room.name != '')
	  		room.$save()
	  			.then(function(room) {
	  				$timeout(function() {$scope.rooms.push(room)}, 500);
	  			})
	  	else
	  		alert('請輸入名字');
  	} else 
  		alert('目前只開放兩間噢');
  }
}

function ShelfCtrl ($scope, $routeParams, $timeout, Room, Shelf, Level, Box, Plant) {
	Shelf.query({room: $routeParams.room})
		.then(function (sheives) {
			$scope.sheives = sheives;
			angular.forEach(sheives, function (shelf) {
				Level.query({shelf: shelf.id}, {sort: {pos: -1}})
					.then( function (levels) {
						shelf.levels = levels;
					});
			});
		});

  makePlant = function (box, obj) {
  	plant = angular.extend(new Plant(), obj);
  	plant.id = Math.uuid(10,10);
		plant.box = box.id;
		plant.$save();
  }
	makeBox = function (level, obj) {
		box = angular.extend(new Box(), obj);
		box.level = level.id;
		box.shelf = level.shelf;
		box.id = Math.uuid(4,10);
		box.$save()
			.then( function	(box) {
				for(i=1; i<=9; i++) {
					makePlant(box, {name: "萵苣", type: 'lettuce', createdAt: new Date()});
				}
			});
	}
	makeLevel = function (shelf, obj) {
		lv = angular.extend(new Level(), obj);
		lv.shelf = shelf.id;
		lv.room = shelf.room;
		lv.id = Math.uuid(3,10);
		lv.$save()
			.then(function (level) {
				for(i=1; i<=9; i++) {
					makeBox(level, {name: "栽培箱"+i });
				}
			})
	}
	$scope.plus = function () {
		if($scope.sheives.length < 3) {
			var shelf = new Shelf();
			shelf.name = "第"+($scope	.sheives.length+1)+"栽培架";
			shelf.id = Math.uuid(2,10)
			shelf.room = $routeParams.room;
			makeLevel(shelf, {name: "上", pos:"up"});
			makeLevel(shelf, {name: "中", pos:"middle"});
			makeLevel(shelf, {name: "下", pos:"down"});
			shelf.$save()
				.then(function (shelf) {
					Level.query({shelf: shelf.id, room: shelf.room}, {sort: {pos: -1}})
						.then(function(levels) {
							shelf.levels = levels;
							$timeout( function() {$scope.sheives.push(shelf)} ,500);
						});
				});
		}
		else
			alert('栽培架不可超過3個');
	}
}

function BoxCtrl ($scope, $routeParams, $timeout, Box) {
	$scope.room = $routeParams.room;
	$scope.shelf = $routeParams.shelf;
	Box.query({level: $routeParams.level}, {sort: {name: 1}})
		.then( function (boxes) {
			$scope.boxes = boxes;
		});

	$scope.plus = function () {
		if($scope.boxes.length < 9) {
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

function PlantCtrl ($scope, $routeParams, Plant) {
	$scope.room = $routeParams.room;
	$scope.shelf = $routeParams.shelf;
	$scope.level = $routeParams.level;
	$scope.box = $routeParams.box;
	Plant.query({box: $routeParams.box}, function (plants) {
		$scope.plants = plants;
		console.log(plants);
	});
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
