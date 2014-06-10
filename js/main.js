// Custom arrowlist widget for JQuery Mobile
(function($) {
	$.widget("mobile.arrowlist", {
		options: {
			theme: false,
		 	clickEvent: 'vclick'
		},
		_create: function() {
			var self = this,
					options = $.extend(
					this.options,
					this.element.jqmData('options')
				),
				display = {
					// The data-role="arrowlist" div
					elem: this.element,

					// The h3 header with the left and right arrows
					header: this.element.prepend('<h3 class="ui-bar-a" class="arrowlist-header"><div class="arrowlist-header-title"></div></h3>')
						.children('h3').first(),

					// The list of content each stored in a span and containing two divs, the title and content
					list: this.element.children('span'),

					// The currently active element in the list
					index: 0
				};

			// The title of the currently active element in the list
			display.title = display.header.children('div').first();

			// Same as "self.display = display;"
			$.extend(self, {
				display: display
			});

			if(options.theme === false) {
				options.theme = $(this).closest('[data-theme]')
					.attr('data-theme');
				if(typeof options.theme === 'undefined') {
					options.theme = 'c';
				}
			}

			self.display.leftArrow = $('<div>')
				.buttonMarkup({
					icon: 'arrow-l',
					theme: options.theme,
					iconpos: 'notext',
					corners: false,
					shadow: true,
					inline: true
				})
				.addClass('ui-corner-left')
				.css({
					'float':'left',
					'margin':'0px'
					// 'paddingLeft':'.4em'
				})
				.prependTo(self.display.header);

		 	self.display.rightArrow = $('<div>')
				.buttonMarkup({
					icon: 'arrow-r',
					theme: options.theme,
					iconpos: 'notext',
					corners: false,
					shadow: true,
					inline: true
				})
				.addClass('ui-corner-right')
				.css({
					'float':'right',
					'margin':'0px'
					// 'paddingRight':'.4em'
				})
				.prependTo(self.display.header);

			$('<div>')
				.css('clear','both')
				.appendTo(self.display.header);

			self.display.leftArrow.on(options.clickEvent, function(e) {
				e.preventDefault();
				var i = self.display.index;
				i = (i-1 < 0) ? self.display.list.length-1 : i-1;
				self._toggleTab(i);
				self.display.index = i;
			});

			self.display.rightArrow.on(options.clickEvent, function(e) {
				e.preventDefault();
				var i = self.display.index;
				i = (i+1 >= self.display.list.length) ? 0 : i+1;
				self._toggleTab(i);
				self.display.index = i;
			});

			self._toggleTab(self.display.index);
		},
		_toggleTab: function(index) {
			var list = this.display.list;

			var currentSpan = list.eq(this.display.index);
			currentSpan.children('div.arrowlist-content').hide();

			var span = list.eq(index);
			span.children('div.arrowlist-content').show();
			this.display.title.html(span.children('div.arrowlist-title').html());
		}
	});
})(jQuery);

/**
 * A basic Model-View-Controller framework written to handle JQuery Mobile pages in a
 * clean and concise way. Insired by AngularJS, written by Jordan Nelson.
 *
 * It works much like AngularJS where you append data attributes to elements, such as
 * <input type="text" mvc-model="variableName"> and then the framework scopes "variableName"
 * to the controller that you define.
 *
 * Example:
 *
 * <!-- This outer element is stored as the "view" internally -->
 * <div id="jqmPageID" mvc-controller="controllerName">
 *   <label for="fieldName">Field</label>
 *   <input type="text" name="fieldName" mvc-model="variableName">
 *   <a href="#" class="ui-btn" mvc-click="methodDefinedInController()">Button Click</a>
 * </div>
 *
 * MVC.controller('controllerName', '#pageID', function($scope) {
 *   // Make an ajax call here to get data from the server
 *
 *   // Set the field values
 *   $scope.variableName = "Value from ajax call";
 *
 *   // Callback function for submitting the data when the button is clicked
 *   $scope.methodDefinedInController = function() {
 *     console.log($scope.variableName);
 *   }
 * });
 *
 * @todo
 *  - Set one event listener on each view, and have events bubble up
 *  - Have input's keyup event trigger an event which bubbles up to the main view element
 *  - Optimize getViewElements()
 */
var MVC = (function($) {
	var self = this;

	// Hash of all of the models
	var models = {};

	// Maps a JQM page to an array of model references that exist on that page
	var pageModels = {};

	// Prefix for special data attributes used by this framework
	var attrPrefix = 'mvc';

	// All the special attributes this framework parses.
	// 
	// Elements that have mvc-controller="controllerName" are synced with the controller
	// defined in Javascript with that given name. This element is also stored as the
	// "view" element internally.
	// 
	// Elements that have mvc-model="variableName" are those which have their values
	// synced to whatever the $scope.variableName object is set to in the controller
	// function.
	// 
	// Elements that have mvc-click="functionName()" have an event handler attached
	// to them which calls $scope.functionName() defined in the controller function.
	// 
	// Elements that have mvc-repeat="arrayVariable" are repeated and populated with
	// each item that exists in the "arrayVariable" defined in the controller. For
	// example, a <select> menu in the DOM only needs to specify one
	//     <option mvc-repeat="arrayVariable">
	// where arrayVariable is an array of objects defined in the controller.
	var attributes = ['controller','model','click', 'repeat'];

	// The Model object that is automatically generated for every Controller and View
	function Model(jqmPageId, controller) {
		// The ID of the JQM page/tab div
		this.jqmPageID = jqmPageId;

		// Reference to the controller function
		this.controller = controller;

		// Glues the view and controller together. The properties and methods defined
		// on this object in the controller function are synced to the DOM elements in
		// the view which point to these properties and methods via the special HTML5
		// data attributes. For example:
		// 
		//    <input type="text" mvc-model="variableName">
		//    <button mvc-click="methodName()">
		// 
		// In this example, variableName is automatically synced with scope.variableName,
		// and so the "value" property of this DOM element will be set to whatever
		// scope.variableName is set to. In additon, methodName() will be called when the
		// button is clicked. This mapping is stored in the "elements" hash below.
		this.scope = {};

		// The JQuery object that references the view element in the DOM. This is the
		// element with the mvc-controller="controllerName" attribute.
		this.view = null;

		// Hash of the view's DOM elements which have the special attributes this framework
		// utilizes. The hash is organized first by each attribute type, and then that points
		// to an inner hash which contains all the elements with the given attribute. Each of
		// those elements' key is their attribute's value, since that value is the name of the
		// variable defined on the $scope object in the controller.
		// 
		// Ex: Remember, 'variableName' is the value of the attribute such as mvc-model="variableName"
		//     and it is synced with $scope.variableName. This hash allows us to do things like:
		//         $scope[variableName] = getValueOfDOMElement(modelElements[variableName]);
		// 
		// {
		//   {'click': {'methodName': refToDomElement, 'methodName2': refToDomElement2 } },
		//   {'model': {'variableName': refToDomElement3, 'variableName2': refToDomElement4 } },
		//   {'controller': {'controllerName': refToDomElement5, 'controllerName': refToDomElement6 } }
		// }
		this.elements = null;

		// Set to true when the repeat elements have been added to the view
		this.repeatsAdded = false;
	}

	/**
	 * Updates the model with the data currently shown in the view.
	 * 
	 * @param  {Object} model The Model instance we need to update
	 * @return {void}
	 */
	var updateModel = function(model) {
		var modelElements = model.elements['model'];
		var $scope = model.scope;

		for(var variableName in $scope) {
			var element = modelElements[variableName];
			if(element && typeof($scope[variableName]) !== 'function') {
				var type = element.getAttribute('type');
				if(type !== "radio") {
					var value = getValue(element);
					/*if(value != null)*/ $scope[variableName] = value;
				} else {
					// Iterate through each radio until we find the selected one
					// The first radio doesn't have a number appended to its name
					// False is returned if the radio isn't selected
					var value = getValue(element);
					if(value !== false) {
						$scope[variableName] = value;
					} else {
						for(var x = 0; x < 23; x++) {
							var key = variableName + "-" + x;
							if(modelElements.hasOwnProperty(key)) {
								value = getValue(modelElements[key]);
								if(value !== false) {
									$scope[variableName] = value;
									break;
								}
							}
							else break;
						}
					}
				}
			}
		}
	};

	/**
	 * Finds all the elements in the given view with the special data attributes that
	 * this framework uses. See the "attributes" member above.
	 * 
	 * @param {jQuery} view
	 *     The JQuery object that references the view in the DOM
	 * @param {Array} attrs
	 *     If defined, the method will only return the elements with these given attributes
     *
	 * @return {Object} Hash of attributes, each pointing to another hash of all the elements
	 *     with those given attributes, where the key of each is the value of the attribute
	 *     since that is the variable name that is synced with the $scope object that is defined
	 *     in the controller.
	 */
	var getViewElements = function(view, attrs) {
		var elements = {};

		if(attrs) {
			var l = attrs.length;
			var attrList = attrs;
		} else {
			var l = attributes.length;
			var attrList = attributes;
		}

		// Iterate through each attribute type. TODO: Note that we are iterating through all the
		// DOM elements in the view each time for every attribute type. This may impact performance
		// and might need to be optimized to be one single recursive iteration.
		for(var x = 0; x < l; x++) {
			elements[attrList[x]] = {};
			var curAttr = elements[attrList[x]];
			var attributeName = attrPrefix + '-' + attrList[x];
			var curElems = view.find('[' + attributeName + ']');

			// If we encounter any radio groups, we need to append IDs to the end of their names to
			// make them distinguishable since each radio in the group has the same
			// mvc-model="radioName" attribute.
			var radioCounters = {};

			// Assign the attribute's value as the key since it is the key for accessing the object
			// on the $scope object, and then set the the value as the reference to the DOM element
			for(var a = 0, ll = curElems.length; a < ll; a++) {
				var variableName = curElems[a].getAttribute(attributeName);
				var type = curElems[a].getAttribute('type');

				// A group of radio buttons each have the same model name, so we need to number them
				if(type !== "radio") {
					curAttr[variableName] = curElems[a];
				} else {
					if(!radioCounters.hasOwnProperty(variableName)) {
						radioCounters[variableName] = 0;
						var newVarName = variableName; // Don't change the name of the first radio
					} else {
						var newVarName = variableName + "-" + radioCounters[variableName]++;
						curElems[a].setAttribute(attrPrefix + '-model', newVarName);
					}

					curAttr[newVarName] = curElems[a];
				}
			}
		}

		return elements;
	};

	/**
	 * Compiles the view by finding elements with special attributes and doing things such
	 * as tying together the controller methods to the buttons with the mvc-click
	 * attribute which calls the methods. This should only be called once per view when
	 * it is loaded.
	 * 
	 * @param  {Object} model The Model instance associated with this view
	 * @return {void}
	 */
	var compileView = function(model) {
		if(model.elements == null)
			model.elements = getViewElements(model.view, ['click','model','repeat']);

		var $scope = model.scope;

		// Go through all the elements with the mvc-click attribute
		// and assign a click handler to that element which calls the
		// corresponding method defined in the controller on $scope.
		var clickElements = model.elements['click'];
		for(var funcName in clickElements) {
			$(clickElements[funcName]).click(function() {
				var functionName = this.getAttribute(attrPrefix + '-click');

				// Remove the trailing parenthesis ()
				functionName = functionName.substring(0, functionName.length-2);

				if($scope.hasOwnProperty(functionName)) {
					updateModel(model);
					$scope[functionName].call(this);
				}
			});
		}
	};

	/**
	 * Abstracts the process of assigning an element to a given value by determining
	 * the type of the element and making the necessary modifications to the jQuery
	 * Mobile GUI elements. For example, setting a checkox's value to true won't make
	 * the checkbox appear checked in JQM because you have to replace the class
	 * "ui-checkbox-off" with "ui-checkbox-on" on the label that lives in front of
	 * the actual checkbox element. Additionaly, the checkbox doesn't use the "value"
	 * attribute to store the checkbox value.
	 * 
	 * @param {DOM Element} elem The element we are assigning the value to
	 * @param {value} value The value to assign to the element
	 * 
	 * @return {Boolean} True if the value was set, and false it was not. It is also
	 *    set to false when a radio button is not checked or is unchecked.
	 */
	var setValue = function(elem, value) {
		if(!elem)
			return false;

		// An input element
		if(/input/i.test(elem.tagName)) {
			var type = elem.getAttribute('type');

			if(type === "checkbox") {
				$(elem).prop('checked', value).checkboxradio('refresh');
			} else if(type === "radio") {
				// If this is the selected radio button, check it
				if(elem.value === value) {
					$(elem).attr('checked', 'checked').checkboxradio('refresh');
				} else {
					$(elem).prop('checked', false).checkboxradio('refresh');
					return false;
				}
			} else {
				elem.value = value;
			}

			return true;
		}
		// A select element
		else if(/select/i.test(elem.tagName)) {
			$(elem).val(value).selectmenu("refresh");
			//elem.value = value;
			//elem.parentNode.getElementsByTagName("span")[0].innerHTML = value;
			return true;
		}
		// This element contains a text field that we need to fill in
		else {
			elem.innerHTML = elem.innerHTML.replace(/(.*)(\{\{.+?\}\})(.*)/i, '$1' + value + '$3');
			return true;
		}

		return false;
	};

	/**
	 * Abstracts the process of returning an element's value. See the description of 
	 * the "setValue" method to see why this is necessary.
	 * 
	 * @param  {DOM Element} elem The element we are extracting the value from
	 * 
	 * @return {String} The DOM element's value property, null if it doesn't exist, or
	 *    false if the element is a radio button or checkbox that isn't selected.
	 */
	var getValue = function(elem) {
		if(!elem)
			return null;

		var type = elem.getAttribute('type');
		var value = null;

		if(type === "checkbox") {
			value = $(elem).prop("checked");
		} else if(type === "radio") {
			value = ($(elem).prop('checked')) ? elem.value : false;
		} else if(type == null && /select/i.test(elem.tagName)) {
			value = elem.options[elem.selectedIndex].value;
		} else {
			value = elem.value;
		}

		return value;
	};

	/**
	 * Updates the view with the data set in the model.
	 * 
	 * @param  {Object} model The Model instance associated with this view
	 * @return {void}
	 */
	var updateView = function(model) {
		var $scope = model.scope;

		// Duplicate any repeat elements that exist
		if(!model.repeatsAdded && model.elements.hasOwnProperty('repeat'))
			addRepeatElements(model);
		model.repeatsAdded = true;

		// Get a reference to the model elements
		if(model.elements.hasOwnProperty('model')) {
			var modelElements = model.elements['model'];
		} else {
			console.log("updateView: No model elements found");
			return;
		}

		// Iterate through the invidiual DOM elements we have already discovered
		// for this view, and update their values
		for(var variableName in $scope) {
			var element = modelElements[variableName];
			var value = $scope[variableName];
			if(element && typeof(value) !== 'function') {
				var type = element.getAttribute('type');
				if(type !== "radio") {
					setValue(element, value);
				} else {
					// Iterate through each radio until we find the selected one
					// The first radio doesn't have a number appended to its name
					setValue(element, value);
					for(var x = 0; x < 23; x++) {
						var key = variableName + "-" + x;
						if(modelElements.hasOwnProperty(key)) {
							if(setValue(modelElements[key], value))
								break;
						}
						else break;
					}
				}
			}
		}
	};

	/**
	 * Goes through the elements with the mvc-repeat="arrayVariable" attribute and
	 * creates a separate item for each item in the list. See the description of
	 * the "repeat" attribute above for more information.
	 *
	 * This function currently supports the following attributes from the $scope
	 * object that will be applied to each repeated element:
	 * 
	 *    "text" => The visible text the user can see
	 *    "value" => The element's value
	 *    "action" => An onclick method
	 *
	 * @todo AngularJS appears to do this with pure innerHTML copying, regexp
	 * matching, and then HTML string generation. This may be a faster approach.
	 * 
	 * @param  {Object} model The Model instance associated with this view
	 * @return {void}
	 */
	// Keeps track of the "action" onclick callback methods that have been defined
	// for individual <option> elements within the select element. We will call
	// them from a single onchange method defined on the parent <select> element.
	// Note that each <select> that has an <option> with a callback method will
	// be given a unique ID as the key in the "onchangeMethods" hash.
	var onchangeMethods = {};
	var addRepeatElements = function(model) {
		var repeatElements = model.elements['repeat'];
		var $scope = model.scope;

		for(var variableName in repeatElements) {
			var curElem = repeatElements[variableName];

			if($scope.hasOwnProperty(variableName)) {
				var list = $scope[variableName];
				var parentElem = curElem.parentNode;
				var isSelectElem = /select/i.test(parentElem.tagName);
				var firstIteration = true;

				if(isSelectElem) {
					var optionIndex = 0;
					var selectUID = guid();

					// Give the <select> element a unique identifier for hashing in onchangeMethods
					parentElem.setAttribute('data-select-uid', selectUID);
					onchangeMethods[selectUID] = {};
				}

				for(var item in list) {
					var curItem = list[item];
					var clone = curElem.cloneNode(false); // TODO: Probably slow
					clone.innerHTML = curItem.text;

					if(curItem.hasOwnProperty('value')) {
						clone.value = curItem.value;
					}

					// We use the onchange method on the <select> if it's a select element
					if(!isSelectElem && curItem.hasOwnProperty('action')) {
						clone.onclick = function() {
							curItem.action.call(this);
						}
					} else if(isSelectElem && curItem.hasOwnProperty('action')) {
						onchangeMethods[selectUID][(optionIndex.toString())] = curItem.action;
					}

					if(firstIteration) {
						// If this is a select element, JQM puts the currently selected value's
						// text in a span that sits above the <select> element
						if(isSelectElem) {
							parentElem.parentNode.firstChild.innerHTML = curItem.text;
						}
						firstIteration = false;
					}

					optionIndex++;
					parentElem.appendChild(clone);
				}

				// If this is a <select> element and any onclick methods were defined for
				// individual <option> elements, have them called in a single onchange method
				// defined on the one <select> element
				if(isSelectElem && onchangeMethods.hasOwnProperty(selectUID)) {
					parentElem.onchange = function() {
						var index = this.selectedIndex.toString();
						var selectUID = this.getAttribute('data-select-uid');
						if(onchangeMethods[selectUID].hasOwnProperty(index)) {
							onchangeMethods[selectUID][index].call(this);
						}
					}
				}

				parentElem.removeChild(curElem);
			}
		}
	};

	// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	var guid = (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return function() {
			return s4() + s4(); //'-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};
	})();

	return {
		/**
		 * Creates a controller for the given page, along with a model
		 * 
		 * @param  {String}   name       The name of the controller
		 * @param  {String}   jqmPageId  The JQM page's ID, including the #
		 * @param  {Function} controller Reference to the controller method
		 * 
		 * @return {Object} Reference to this object to allow chaining
		 */
		controller: function(name, jqmPageId, controller) {
			models[name] = new Model(jqmPageId, controller);

			if(!pageModels.hasOwnProperty(jqmPageId))
					pageModels[jqmPageId] = [];

			// Add the model to the list associated with the JQM page
			pageModels[jqmPageId].push({
				name: name,
				ref: models[name]
			});

			return self;
		},

		/**
		 * Call this to initialize the MVC framework. It should be called after
		 * you have defined all of your controllers.
		 * 
		 * @return {void}
		 */
		init: function() {
			// Add listeners for each JQM page to initialize their controllers
			for(var pageID in pageModels) {
				$(document).on("pagecreate", pageID, function(event) {
					// Activate each controller that exists on this page
					var curPageID = event.handleObj.selector;
					var list = pageModels[curPageID];
					for(var x = 0; x < list.length; x++) {
						var model = list[x].ref;
						var controllerName = list[x].name;

						model.view = $('[' + attrPrefix + '-controller="' + controllerName + '"]');

						if(model.view.length == 1) {
							compileView(model);
							model.controller.call(this, model.scope);
							updateView(model);
						} else if(model.view.length < 1) {
							console.log("Error: Could not find controller \"" + 
								controllerName +"\"'s' view element.");
						} else {
							console.log("Error: Controller \"" + controllerName + 
								"\"'s' had more than one view element.");
						}
					}
				});
			}

			return self;
		}
	};
})(jQuery);

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

	$scope.delete = function() {
		console.log("delete");
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

// 			tripSummary: {
// 				month: null,
// 				totalMiles: -1,
// 				days: [
// 					{
// 						date: null, trips: [
// 							{from: null, to: null, miles: -1, business: false},
// 							{from: null, to: null, miles: -1, business: false}
// 						]
// 					}
// 				]
// 			},