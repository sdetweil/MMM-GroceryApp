const NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({
	start() {
		console.log("Starting node helper for: " + this.name);
	},

getToken(config) {
	try {
		const token = getTokenInternal(config);
		console.log("returning token="+token)
		return token;
    } catch (err) {
		console.log(err);
		return "abc";
	}
},

getTokenInternal(config) {

	// Set the configuration settings
	const credentials = {
		client: {
			id: config.client_id,
			secret: config.client_secret
		},
		auth: {
			tokenHost: "https://api.kroger.com",
			tokenPath: "/v1/connect/oauth2/token"
		  },
		  http: {
			headers: { "User-Agent": "MMM-GroceryApp" }
		}
	};

	const oauth2 = require("Basic").create(credentials);

		const tokenConfig = {
			grant_type: config.client_credentials,
			client_secret: config.client_secret,
			client_id: config.client_id
		};

		try {
			var tokenObject = oauth2.client_secret.getToken(tokenConfig);
			console.log("returning tokenObject="+tokenObject)
			return tokenObject.access_token;
		} catch (error) {
			console.log("Access Token Error", error.message);
	}
},

	
getData: function() {
		var self = this;

	function getCartData(token) {
			request.get({
				url: baseUrl + "/v1/cart/add",
				headers: {
					"Accept": "application/json",
					"Authorization": "Bearer {{TOKEN}}"
					  },
				"processData": false,
				"data": "{\n  \"items\": [\n     {\n       \"upc\": \"0001200016268\",\n       \"quantity\": \2\\n      }\n    ]\n }"
				},
			function (error, response) {
				console.log("getCartData response status="+response.statusCode)
				if (!error && response.statusCode == 400) {
					self.sendSocketNotification("CART_DATA", response);
				}
			});
		}
	function getProductSearch(token) {
			request.get({
				url: baseUrl + "/v1/products?filter.brand={{BRAND}}&filter.term={{TERM}}&filter.locationId={{LOCATION_ID}}",
				headers: {
					"Accept": "application/json",
					"Authorization": "Bearer {{TOKEN}}"
					  },
			function (error, response) {
				console.log("getProductSearchresponse status="+response.statusCode)
				if (!error && response.statusCode == 400) {
					self.sendSocketNotification("PRODUCT_SEARCH", response);
				}
			}}
		);
	}
	function getProductDetails(token) {
			request.get({
				url: baseUrl + "/v1/products/{{ID}}?filter.locationId={{LOCATION_ID}}",
				headers: {
					"Accept": "application/json",
					"Authorization": "Bearer {{TOKEN}}"
					  },
			function (error, response) {
				console.log("getProductDetails status="+response.statusCode)
				if (!error && response.statusCode == 400) {
					self.sendSocketNotification("PRODUCT_DETAILS", response);
				}
			}}
		);
	}
	function getLocationData(token) {
			request.get({
				url: baseUrl + "/v1/locations",
				headers: {
					"Accept": "application/json",
					"Authorization": "Bearer {{TOKEN}}"
					  },
			function (error, response) {
				console.log("getLocationData status="+response.statusCode)
				if (!error && response.statusCode == 400) {
					self.sendSocketNotification("LOCATION_DATA", response);
				}
			}}
		);
	}
		if (accessToken === null ) {
				var tempToken = getToken(this.config);
				var localToken = tempToken.then(function(accessToken){
					consol.log("returning accessToken")
					return accessToken;
				});

				localToken.then(function(token) {
					accessToken = token;
					getCartData(token);
					getProductSearch(token);
					getProductDetails(token);
					getLocationData(token);
			});
		}
		else {
			getCartData(accessToken);
			getProductSearch(accessToken);
			getProductDetails(accessToken);
			getLocationData(token);
		}
	},

	socketNotificationReceived: function(notification, payload) {
			let self = this
		if (notification === "CONFIG") {
			self.config = payload;
			this.sendSocketNotification("MMM-GroceryApp");
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		} else if (notification == "UPDATE") {
			//  maybe wait for data?
			self.sendSocketNotification("CART_DATA", self.cart_data);
			self.sendSocketNotification("PRODUCT_SEARCH", self.product_search);
			self.sendSocketNotification("PRODUCT_DETAILS", self.product_details);
			self.sendSocketNotification("LOCATION_DATA", self.location_data);
	    }
	}
});