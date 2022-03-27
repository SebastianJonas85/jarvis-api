import axios from 'axios';

class Herbert {
	constructor() {
		this.BASE_URL = 'http://192.168.178.39/json';
		this.USERNAME = process.env.HERBERT_USERNAME;
		this.PASSWORD = process.env.HERBERT_PASSWORD;
	}

	async sendCommand(command) {
		try {
			const herbertsUrl = `${this.BASE_URL}${command}`;

			const authOptions = {
				auth: {
					username: this.USERNAME,
					password: this.PASSWORD,
				},
			};
			console.log('Herbert.sendCommand()', herbertsUrl);
			const response = await axios.get(herbertsUrl, authOptions);
			return response.data;
		} catch (error) {
			console.log(error.message);
			throw error;
		}
	}
}

export { Herbert };
