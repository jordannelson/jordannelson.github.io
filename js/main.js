MVC.factory('trips', function($rootScope) {
	var factory = {};

	factory.trips = [
		{ name: 'Home/Work', distance: 875 },
		{ name: 'Home/Grocery', distance: 23 }
	];

	factory.broadcastNewTrip = function(trip) {
		this.trips.push(trip);
		$rootScope.$broadcast('addNewTripEvent');
	};

	return factory;
});

// Enter Trip Data
MVC.controller('enterTripDataCtrl', '#enterTripDataPage', function($scope) {
	// Make AJAX call here

	// Set the field values
	$scope.date = generateJQMDateStr();
	$scope.businessTrip = true;
	$scope.beginningOdometer = 123;
	$scope.endingOdometer = 321;
	$scope.favoriteTrip = "2";

	var factory = MVC.factory('trips');
	var trips = factory.trips;

	$scope.favoriteTrips = [
		{ value: "1", text: trips[0].name },
		{ value: "2", text: trips[1].name },
		{ value: "3", text: "Add New Trip", action: function() {
			$.mobile.changePage("#addNewTripPage", {
				transition: "none",
				changeHash: true,
				role: 'dialog'
			});
		}}
	];

	// When a new trip is added
	$scope.$on('addNewTripEvent', function() {
		$scope.favoriteTrips.push(factory.trips[factory.trips.length-1]);
		$scope.$apply(); // Update the view
	});

	// Callback function for submitting the data
	$scope.saveTrip = function() {
		console.log("date = " + $scope.date);
		console.log("business = " + $scope.businessTrip);
		console.log("beginningOdometer = " + $scope.beginningOdometer);
		console.log("endingOdometer = " + $scope.endingOdometer);
		console.log("favoriteTrip = " + $scope.favoriteTrip);

		$.mobile.changePage("#tabsPage", {
			transition: "none",
			changeHash: true
		});
	}
});

// Enter Trip Data
MVC.controller('addNewTripCtrl', '#addNewTripPage', function($scope) {
	var factory = MVC.factory('trips');

	// Set the field values
	$scope.name = 'new trip name';
	$scope.distance = 587;

	// Callback function for submitting the data
	$scope.saveNewTrip = function() {
		factory.broadcastNewTrip({
			name: $scope.name,
			distance: $scope.distance
		});

		$.mobile.changePage("#tabsPage", {
			transition: "none",
			changeHash: true
		});
	}
});

// Fuel Tab
MVC.controller('fuelCtrl', '#tabsPage', function($scope) {
	// Make AJAX call here

	$scope.date = generateJQMDateStr();
	$scope.odometer = 729;
	$scope.fuelPrice = 4.39;
	$scope.numGallons = 11.23;
	$scope.totalCost = 49.2997;
	$scope.gallonsText = 12.580;
	$scope.mpgText = 27.6;

	$scope.save = function() {
		console.log("date = " + $scope.date);
		console.log("odometer = " + $scope.odometer);
		console.log("fuelPrice = " + $scope.fuelPrice);
		console.log("numGallons = " + $scope.numGallons);
		console.log("totalCost = " + $scope.totalCost);
	}

	$scope.cancel = function() {
		console.log("cancel");
	}
});

// Reports Tab
MVC.controller('reportsCtrl', '#tabsPage', function($scope) {
	// Make AJAX call here

	$scope.beginningOdometer = 587.7;
	$scope.endingOdometer = 1035.5;
	$scope.totalBusinessMileage = 421.8;
	$scope.totalPersonalMileage = 26;
	$scope.percentBusiness = 94;
	$scope.percentPersonal = 6;
	$scope.totalFuelPurchases = 323.87;
	$scope.averageMPG = 23.6;
});

// First Visit Page
MVC.controller('firstVisitCtrl', '#firstVisitPage', function($scope) {
	// Make AJAX call here

	$scope.measurementUnit = 'imperial';
	$scope.employeeNumber = 12345678;
	$scope.vehicleYear = '2013';
	$scope.vehicleMake = 'Nissan';
	$scope.vehicleModel = 'Truck';
	$scope.licensePlate = 'JKY-7A8';
	$scope.state = 'TX';
	$scope.vinNumber = '1234567890123456789';
	$scope.odometer = 729;

	$scope.vehicleYears = [
		{ text: 'Vehicle Year', value: '0' },
		{ text: '2014' },
		{ text: '2013', action: function() {
			console.log("vehicle years 2013");
		}},
		{ text: '2012', action: function() {
			console.log("vehicle years 2012");
		}}
	];

	$scope.vehicleMakes = [
		{ text: 'Vehicle Make', value: '0' },
		{ text: 'Honda' },
		{ text: 'Lexus' },
		{ text: 'Nissan' },
		{ text: 'Mazda' },
		{ text: 'Volkswagen' }
	];

	$scope.states = [
		{ text: 'State', value: '0' },
		{ text: 'CA' },
		{ text: 'NY' },
		{ text: 'TX' }
	];

	$scope.submit = function() {
		console.log("measurementUnit = " + $scope.measurementUnit);
		console.log("employeeNumber = " + $scope.employeeNumber);
		console.log("vehicleYear = " + $scope.vehicleYear);
		console.log("state = " + $scope.state);
	}

	$scope.cancel = function() {
		console.log("cancel");
	}

	$scope.changeUnitDisplay = function() {
		if($scope.measurementUnit === 'metric') {
			$('#unitDisplay').html('Mi');
		} else {
			$('#unitDisplay').html('Km');
		}
	}
});

MVC.init();