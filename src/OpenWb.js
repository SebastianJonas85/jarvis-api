import * as mqtt from 'mqtt'; // import everything inside the mqtt module and give it the namespace "mqtt"

const TOPICS = [
	'openWB/lp/1/%Soc',
	'openWB/lp/1/kWhDailyCharged',
	// 'openWB/lp/1/ADirectModeAmps', // Sofort laden Soll Stromstärke
	// 'openWB/lp/1/PercentDirectChargeModeSoc', // Bis zu wieviel % im Sofort Laden Untermodus SoC geladen wird
	// 'openWB/lp/1/strChargePointName', // Name des Ladepunktes
	// 'openWB/lp/1/boolChargeAtNight', // Nachtladen aktiv 1 / 0
	// 'openWB/lp/1/kWhDirectModeToChargekWh', // Zu ladende kWh im Sofortladen Untermodus Lademenge
	// 'openWB/lp/1/boolDirectChargeMode_none_kwh_soc', // Sofort Laden Untermodus, 0 = nein, 1 = kWH (Lademenge, 2= bis xx%SoC)
	'openWB/lp/2/TimeRemaining',
	// 'openWB/lp/2/ADirectModeAmps',
	// 'openWB/lp/2/boolChargePointConfigured', // Gibt an ob ein zweiter Ladepunkt konfiguriert ist
	// 'openWB/lp/1/boolDirectModeChargekWh', // Gibt an ob der Sofort Laden Untermodus Lademenge aktiv ist
	// 'openWB/pv/W', // PV Leistung in Watt, Erzeugung ist negativ
	'openWB/evu/W', // Leistung am Hausübergabepunkt, Bezug ist positiv, Einspeisung negativ
	// 'openWB/evu/APhase3', // A an Phase 3 am Hausanschluss
	// 'openWB/evu/APhase1', // A an Phase 1 am Hausanschluss
	// 'openWB/evu/APhase2', // A an Phase 2 am Hausanschluss
	// 'openWB/global/WHouseConsumption', // Hausverbrauch (errechnet aus PV, EVU, EV, Speicher) in Watt
	// 'openWB/global/WAllChargePoints', // Leistung aller Ladepunkte zusammen
	// 'openWB/boolChargeAtNight_direct', // Gibt an ob Nachtladen im Sofort laden Modus aktiv ist
	// 'openWB/boolChargeAtNight_nurpv', // Gibt an ob Nachtladen im Nur PV Modus aktiv ist
	// 'openWB/boolChargeAtNight_minpv', // Gibt an ob Nachtladen im Min + PV Modus aktiv ist
	// 'openWB/boolDisplayHouseConsumption', // Gibt an ob der Hausverbrauch angezeigt werden soll
	// 'openWB/boolDisplayDailyCharged', // Gibt an ob „Heute geladen“ angezeigt werden soll
	// 'openWB/boolEvuSmoothedActive', // Daten für den Live Graph, meist letzte Stunde
	// 'openWB/Verbraucher/WNr1', // Verbrauch 1 Leistung in Watt
	// 'openWB/Verbraucher/WhImportedNr1', // Bezugszähler in Wh
	// 'openWB/Verbraucher/WhExportedNr1', // Exportzähler in Wh
	// 'openWB/Verbraucher/WNr2', // Verbrauch 2 Leistung in Watt
	// 'openWB/Verbraucher/WhImportedNr2', // Bezugszähler in Wh
	// 'openWB/Verbraucher/WhExportedNr2', // Exportzähler in Wh
	// 'openWB/evu/WhExported', // Eingespeiste Energie in Wh (Zählerstand)
	// 'openWB/evu/WhImported', // Bezogene Energie in Wh (Zählerstand)
	// 'openWB/pv/CounterTillStartPvCharging', // Counter für die PV Ladung
	// 'openWB/pv/WhCounter', // Zählsterstand in Wh PV erzeugte Energie
	// 'openWB/lp/1/PfPhase1', // Power Factor
	// 'openWB/lp/1/PfPhase2', // Power Factor
	// 'openWB/lp/1/PfPhase3', // Power Factor
	// 'openWB/evu/ASchieflast', // Schieflast in A am Hausübergabepunkt
	// 'openWB/evu/WPhase1', // Leistung in Watt am Hausübergabepunkt
	// 'openWB/evu/WPhase2', // Leistung in Watt am Hausübergabepunkt
	// 'openWB/evu/WPhase3', // Leistung in Watt am Hausübergabepunkt
	// 'openWB/strLastmanagementActive', // Gibt an ob das Lastmanagement aktiv bzw. den String zur Ausgabe dafür

	// ####Jeweils für alle Ladepunkte verfügbar ######
	// 'openWB/lp/4/ADirectModeAmps', // Sofort laden Soll Stromstärke
	// 'openWB/lp/4/boolChargePointConfigured', // Gibt an ob ein zweiter Ladepunkt konfiguriert ist
	'openWB/lp/1/ChargeStatus', // Gibt an ob theoretisch der Ladepunkt freigegeben ist (wird von ChargePointEnabled übersteuert), Int 0 oder 1
	// 'openWB/lp/1/ChargePointEnabled', // "Master" (De-) Aktivierung eines Ladepunktes. Int 0 oder 1
	// 'openWB/lp/1/APhase1', // Stromstärke in Ampere
	// 'openWB/lp/1/APhase2', // Stromstärke in Ampere
	// 'openWB/lp/1/APhase3', // Stromstärke in Ampere
	// 'openWB/lp/1/VPhase1', // Spannung in Volt
	// 'openWB/lp/1/VPhase2', // Spannung in Volt
	// 'openWB/lp/1/VPhase3', // Spannung in Volt
	'openWB/lp/1/kWhCounter', // Zählerstand in Wh an Ladepunkt 1
	'openWB/lp/1/W', // Ladeleistung in Watt
	// 'openWB/lp/1/boolPlugStat 1', // Steckererkennung = steckend
	// 'openWB/lp/1/boolChargeStat 1', // Steckerereckennung = ladend
	// 'openWB/lp/1/AConfigured 8', // Ampere mit denen geladen werden soll
	// 'openWB/lp/1/kWhActualCharged 0.64', // Geladene kWh des aktuellen Ladevorgangs
	// 'openWB/lp/1/kWhChargedSincePlugged 4.44', // Geladene kWh seit letztem anstecken
	'openWB/global/ChargeMode', // Lademodus, 0 = Sofort Laden (Direct), 1 = Min und PV, 2 = Nur PV, 3 = Stop, 4 = Standby

	// // SCHREIBEND:
	'openWB/set/ChargeMode',
	// // 0 = Sofort Laden (Direct), 1 = Min und PV, 2 = Nur PV, 3 = Stop, 4 = Standby
	// ,"openWB/set/lp1/DirectChargeSubMode"
	// // Setzt den Sofort Laden (Direct) Untermodus, Int 0 = Aus, 1 = kWh Laden, 2 = SoC Laden
	// ,"openWB/set/lp2/DirectChargeSubMode"
	// // Setzt den Sofort Laden (Direct) Untermodus, Int 0 = Aus, 1 = kWh Laden, 2 = SoC Laden
	// ,"openWB/set/lp1/DirectChargeSoc"
	// // Setzt den Sofort Laden (Direct) Untermodus SoC Wert bis zu dem geladen werden soll, Int 1 - 100
	// ,"openWB/set/lp1/DirectChargeSoc"
	// // Setzt den Sofort Laden (Direct) Untermodus SoC Wert bis zu dem geladen werden soll, Int 1 - 100

	// // ####Jeweils für alle Ladepunkte verfügbar ######
	// ,"openWB/set/lp1/ChargePointEnabled"
	// // (De-) Aktivieren des Ladepunktes, unabhängig von gewähltem Lademodus oder Einstellungen, Int 0 oder 1
	// ,"openWB/set/lp1/DirectChargeAmps"
	// // Ampere mit denen im Sofortladen Modus geladen werden soll, Int 6-32
	// ,"openWB/set/lp1/kWhDirectChargeToCharge"
	// // Setzt die Lademenge in kWh für den Sofort Laden Untermodus Lademenge, Int 1-100
	// ,"openWB/set/lp3/DirectChargeSubMode"
	// // Ladepunkt 3-8, setzt den Sofort Laden (Direct) Untermodus, Int 0 = Aus, 1 = kWh Laden
	// ,"openWB/set/lp1/boolResetDirectCharge"
	// // Setzt die geladene Menge auf 0 zurück für den Sofort Laden Untermodus Lademenge, Int 1
];

class OpenWb {
	constructor() {
		this.data = {};
		var self = this;
		this.client = mqtt.connect('mqtt://openwb'); // create a client

		this.client.on('connect', function () {
			TOPICS.forEach((topic) => {
				self.client.subscribe(topic);
			});
		});

		this.client.on('message', function (topic, message) {
			// message is Buffer
			self.data[topic] = message.toString();
			console.log(topic, message.toString());
		});
	}

	async overview() {
		return this.data;
	}

	async setChargeMode(mode) {
		this.client.publish('openWB/set/ChargeMode', '' + mode);
	}
}

export { OpenWb };
