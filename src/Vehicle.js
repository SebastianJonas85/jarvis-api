// forked from https://github.com/d4v3y0rk/ffpass-module

import axios from 'axios';
import qs from 'querystring';

const defaultHeaders = new Map([
	['Accept', '*/*'],
	['Accept-Language', 'en-us'],
	['Content-Type', 'application/json'],
	['Accept-Encoding', 'gzip, deflate, br'],
]);

const fordHeaders = new Map([...defaultHeaders, ['Application-Id', '71A3AD0A-CF46-4CCF-B473-FC7FE5BC4592']]);
const iamHeaders = new Map([...defaultHeaders, ['Content-Type', 'application/x-www-form-urlencoded']]);

const fordAPIUrl = 'https://usapi.cv.ford.com';
const authUrl = 'https://sso.ci.ford.com';
const tokenUrl = 'https://api.mps.ford.com';

class Vehicle {
	constructor(username, password, vin) {
		this.username = username;
		this.password = password;
		this.vin = vin;
		this.token = '';
		this.outdatedAfterSeconds = 5 * 60;
		this.maxRefreshTrials = 20;
	}

	async auth() {
		var requestData = new Map([
			['client_id', '9fb503e0-715b-47e8-adfd-ad4b7770f73b'],
			['grant_type', 'password'],
			['username', this.username],
			['password', this.password],
		]);
		var options = {
			method: 'POST',
			baseURL: authUrl,
			url: '/v1.0/endpoint/default/token',
			headers: Object.fromEntries(iamHeaders),
			data: qs.stringify(Object.fromEntries(requestData)),
		};

		try {
			var result = await axios.request(options);
		} catch (err) {
			console.log(err.status);
			throw err.status;
		}

		if (result.status == 200) {
			this.token = result.data.access_token;

			var tokenOptions = {
				method: 'PUT',
				baseURL: tokenUrl,
				url: '/api/oauth2/v1/token',
				headers: Object.fromEntries(fordHeaders),
				data: { code: this.token },
			};

			try {
				var tokenResult = await axios.request(tokenOptions);
			} catch (err) {
				console.log(err.result);
				throw err.result;
			}
			this.token = tokenResult.data.access_token;
			return tokenResult.data.access_token;
		} else {
			console.log(result);
			throw 'statuscode is ' + result.status;
		}
	}

	async status() {
		fordHeaders.set('auth-token', this.token);
		var options = {
			baseURL: fordAPIUrl,
			url: `/api/vehicles/v4/${this.vin}/status`,
			headers: Object.fromEntries(fordHeaders),
			params: {
				lrdt: '01-01-1970 00:00:00',
			},
		};

		try {
			var result = await axios.request(options);
		} catch (err) {
			console.log(err.result);
			throw err.result;
		}

		if (result.status == 200) {
			// Check if the last update timestamp is too old
			// The lastRefresh timestamp is given in UTC. In order to parse the unix time correctly
			// We must add a "Z" so that it gets parsed as UTC
			var vehicleStatus = result.data.vehiclestatus;
			var lastUpdate = Date.parse(vehicleStatus.lastRefresh + 'Z');
			var dateNow = Date.now();
			var diffInSeconds = (dateNow - lastUpdate) / 1000;

			if (diffInSeconds > this.outdatedAfterSeconds) {
				console.log('Updating status!');
				vehicleStatus = await this.requestStatusRefreshSync();
			}

			return vehicleStatus;
		} else {
			throw `statuscode is ${result.status}`;
		}
	}

	normalizeObject(obj) {
		let normalizedData = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key) && obj[key] !== null) {
				const element = obj[key];

				if (element.hasOwnProperty('value')) {
					normalizedData[key] = element.value;
				} else if (typeof element === 'object') {
					normalizedData[key] = this.normalizeObject(element);
				}
			}
		}
		return normalizedData;
	}

	async issueCommand(command) {
		fordHeaders.set('auth-token', this.token);
		var method = '';
		var url = '';
		if (command == 'start') {
			method = 'PUT';
			url = `/api/vehicles/v2/${this.vin}/engine/start`;
		} else if (command == 'stop') {
			method = 'DELETE';
			url = `/api/vehicles/v2/${this.vin}/engine/start`;
		} else if (command == 'lock') {
			method = 'PUT';
			url = `/api/vehicles/v2/${this.vin}/doors/lock`;
		} else if (command == 'unlock') {
			method = 'DELETE';
			url = `/api/vehicles/v2/${this.vin}/doors/lock`;
		} else {
			throw 'No command specified for issueCommand!';
		}
		var options = {
			method: method,
			baseURL: fordAPIUrl,
			url: url,
			headers: Object.fromEntries(fordHeaders),
		};

		try {
			var result = await axios.request(options);
		} catch (err) {
			console.log(err);
			throw err;
		}

		if (result.status == 200) {
			return result.data;
		} else {
			throw `statuscode is ${result.status}`;
		}
	}

	async requestStatusRefreshSync() {
		var commandId = await this.requestStatusRefresh();
		fordHeaders.set('auth-token', this.token);
		var options = {
			baseURL: fordAPIUrl,
			url: `/api/vehicles/v3/${this.vin}/statusrefresh/${commandId}`,
			headers: Object.fromEntries(fordHeaders),
		};

		var api_status = 0;
		for (let counter = 0; counter < this.maxRefreshTrials; counter++) {
			try {
				var result = await axios.request(options);
				api_status = result.data.status;
			} catch (err) {
				console.log(err);
			}

			if (api_status == 200) {
				return result.data.vehicleStatus;
			} else {
				console.log(`Waiting for the status to refresh - sleeping for 1500ms - ${result.data.status}`);
				await new Promise((resolve_sleep) => {
					setTimeout(resolve_sleep, 1500);
				});
			}
		}

		throw 'Refresh failed!';
	}

	async requestStatusRefresh() {
		fordHeaders.set('auth-token', this.token);
		var options = {
			method: 'PUT',
			baseURL: fordAPIUrl,
			url: `/api/vehicles/v2/${this.vin}/status`,
			headers: Object.fromEntries(fordHeaders),
		};

		try {
			var result = await axios.request(options);
		} catch (err) {
			console.log(err);
			throw err;
		}

		if (result.status == 200) {
			return result.data.commandId;
		} else {
			throw `statuscode is ${result.status}`;
		}
	}
}

export { Vehicle };
