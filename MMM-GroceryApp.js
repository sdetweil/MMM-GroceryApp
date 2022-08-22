Module.register("MMM-GroceryApp", {
	defaults: {
		refreshInterval: 1000 * 60 * 5, // refresh every 5 minutes
		updateInterval: 1000 * 60 * 5 // update every 5 minutes
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		Log.info("Starting module: " + this.name);

		//Flag for check if module is loaded
		this.loaded = false;

		this.sendSocketNotification("CONFIG", this.config);
	},

	getStyles: function () {
		return [
			"MMM-GroceryApp.css"
		];
	},

	getScripts: function () {
		return [
			"moment.js"
		];
	},

  getStats: function () {
    this.sendSocketNotification("UPDATE", this.config);
  },

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to node_helper.js
		this.sendSocketNotification("MMM-GroceryApp-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from node_helper.js
 	socketNotificationReceived: function(notification, payload) {
		 console.log("socketNotificationReceived");
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if (notification === "CART_DATA") {
			this.loaded = true;
			this.processChargeData(JSON.parse(payload).response);
			this.updateDom();
		}
		else if (notification === "PRODUCT_SEARCH") {
			this.loaded = true;
			this.processDrivestateData(JSON.parse(payload).response);
			this.updateDom();
		}
		else if (notification === "PRODUCT_DETAILS") {
			this.loaded = true;
			this.processVehicleData(JSON.parse(payload).response);
			this.updateDom();
		}
		else if (notification === "LOCATION_DATA") {
			this.loaded = true;
			this.processVehicleData(JSON.parse(payload).response);
			this.updateDom();
		}
	},

	getDom: function() {
		// create element wrapper for show into the module
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.style.cssText = "float: right;";

		// Data from helper
		if (this.loaded) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			wrapper.appendChild(wrapperDataNotification);
		} else {
			wrapper.innerText="Loading..."
		}

		return wrapper;
}
});