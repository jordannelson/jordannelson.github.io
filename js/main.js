// Enter Trip Data
MVC.controller('enterTripDataCtrl', '#enterTripDataPage', function($scope) {
	// Make AJAX call here

	// Set the field values
	$scope.date = generateJQMDateStr();
	$scope.businessTrip = true;
	$scope.beginningOdometer = 123;
	$scope.endingOdometer = 321;
	$scope.favoriteTrip = "2";
	$scope.favoriteTrips = [
		{ value: "1", text: "First Text" },
		{ value: "2", text: "Second Text" },
		{ value: "3", text: "Add New Trip", action: function() {
			console.log("open modal window");
		}}
	];

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

	$scope.measurementUnit = 'metric';
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
});

MVC.init();

function generateJQMDateStr() {
	var today = new Date();
	var dd = today.getDate().toString();
	var mm = (today.getMonth() + 1).toString(); // January is 0
	var yyyy = today.getFullYear().toString();

	if(dd.length <= 1)
		dd = "0" + dd;
	if(mm.length <= 1)
		mm = "0" + mm;

	return yyyy + '-' + mm + '-' + dd;
}