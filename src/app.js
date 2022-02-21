import { resolve } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CronJob } from 'cron';
import logger from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import { Vehicle } from './Vehicle.js';
const vehicle = new Vehicle(process.env.FORDPASS_USERNAME, process.env.FORDPASS_PASSWORD, process.env.FORDPASS_VIN);

import express from 'express';
import { AuraManager } from './AuraManager.js';
const auraManager = new AuraManager();
const app = express();
app.use(logger(':method :url :status :response-time ms :user-agent'));

const HOSTNAME = 'localhost';
const PORT = 3000;
const SERVICE_URL = `http://${HOSTNAME}:${PORT}`;

app.get('/vehicle', async (req, res) => {
	try {
		await vehicle.auth();
		const data = await vehicle.status();

		let normalizedData = vehicle.normalizeObject(data);
		normalizedData.gps = { latitude: data.gps.latitude, longitude: data.gps.longitude };
		res.set('Content-Type', 'text/plain');
		res.send(JSON.stringify(normalizedData));
	} catch (error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
});

app.get('/vehicle/soc', async (req, res) => {
	try {
		await vehicle.auth();
		const data = await vehicle.status();

		res.set('Content-Type', 'text/plain');
		res.send(JSON.stringify(parseInt(data.batteryFillLevel.value)));
	} catch (error) {
		console.log(error.message);
		res.status(500).send(error.message);
	}
});

app.get('/vehicle/location', async (req, res) => {
	try {
		await vehicle.auth();
		const data = await vehicle.status();

		res.set('Content-Type', 'text/plain');
		delete data.gps.status;
		delete data.gps.timestamp;
		res.send(JSON.stringify(data.gps));
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

app.get('/pv/history', async (req, res) => {
	try {
		let data = await auraManager.getHistory();
		res.set('Content-Type', 'application/json');
		res.send(JSON.stringify(data));
	} catch (error) {
		console.log(error.message);
		res.sendStatus(500).send(error.message);
	}
});

app.get('/pv/:metric', async (req, res) => {
	try {
		let data = await auraManager.get(req.params.metric);
		res.set('Content-Type', 'text/plain');
		res.send(JSON.stringify(data));
	} catch (error) {
		console.log(error.message);
		res.sendStatus(500).send(error.message);
	}
});

app.get('/pv', async (req, res) => {
	try {
		let data = await auraManager.overview();
		res.set('Content-Type', 'application/json');
		res.send(JSON.stringify(data));
	} catch (error) {
		console.error(error.message);
		res.sendStatus(500).send(error.message);
	}
});

app.listen(PORT);

console.log(`🚀 Started server on port ${PORT}`);
console.log('Available Endpoints:');

console.info(`✔️ ${SERVICE_URL}/vehicle`);
console.info(`✔️ ${SERVICE_URL}/vehicle/soc`);
console.info(`✔️ ${SERVICE_URL}/vehicle/location`);

console.info(`✔️ ${SERVICE_URL}/pv`);
console.info(`✔️ ${SERVICE_URL}/pv/history`);

auraManager.PV_METRICS.forEach((metric) => {
	console.info(`✔️ ${SERVICE_URL}/pv/${metric}`);
});

var job = new CronJob(
	'*/30 * * * * *',
	async () => {
		try {
			await auraManager.saveHistory();
			console.log('Saved history');
		} catch (error) {
			console.log(error.message);
		}
	},
	null,
	true
);
job.start();
