import axios from 'axios';

class AuraManager {
	constructor() {
		this.PV_METRICS = [
			'PowerIn',
			'PowerOut',
			'PowerConsumed',
			'PowerProduced',
			'PowerConsumedFromGrid',
			'PowerConsumedFromProducers',
			'PowerOutFromProducers',
			'PowerSelfConsumed',
			'PowerSelfSupplied',
			'WorkIn',
			'WorkOut',
			'WorkConsumed',
			'WorkProduced',
			'WorkConsumedFromGrid',
			'WorkConsumedFromProducers',
			'WorkOutFromProducers',
			'WorkSelfConsumed',
			'WorkSelfSupplied',
		];
		this.AURA_MANAGER_API_URL = process.env.AURA_MANAGER_API_URL;
	}

	async get(name) {
		var data = await this.overview();
		return data[name];
	}

	async overview() {
		var data = await this._getResponse();
		var result = {};

		for (let index = 0; index < data.result.items.length; index++) {
			const item = data.result.items[index];
			for (const [key, value] of Object.entries(item.tagValues)) {
				if (this.PV_METRICS.includes(key)) {
					result[key] = parseInt(value.value);
				}
			}
		}

		let ordered = Object.keys(result)
			.sort()
			.reduce((obj, key) => {
				obj[key] = result[key];
				return obj;
			}, {});

		return ordered;
	}

	async _getResponse() {
		try {
			var result = await axios.get(`${this.AURA_MANAGER_API_URL}/rest/kiwigrid/wizard/devices`);
			return result.data;
		} catch (err) {
			console.log(err);
			return err;
		}
	}
}

export { AuraManager };
