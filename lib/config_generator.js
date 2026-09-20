const DefaultSettings = {
	dialogEnabled: true,
	balloonEnabled: true,
	debugEnabled: false,
	dungeonOverrideEnabled: false,
	DEFAULT_SILENCED_NPCS: [
		{ name: "Monti", huntingZoneId: 63, templateId: 1960 },
		{ name: "Oldi", huntingZoneId: 63, templateId: 1961 },
		{ name: "Mimi", huntingZoneId: 63, templateId: 1962 },
		{ name: "Malo", huntingZoneId: 63, templateId: 1963 },
		{ name: "Sionne", huntingZoneId: 63, templateId: 1965 }
	],
	silencedNpcList: [
		{ name: "Monti", huntingZoneId: 63, templateId: 1960 },
		{ name: "Oldi", huntingZoneId: 63, templateId: 1961 },
		{ name: "Mimi", huntingZoneId: 63, templateId: 1962 },
		{ name: "Malo", huntingZoneId: 63, templateId: 1963 },
		{ name: "Sionne", huntingZoneId: 63, templateId: 1965 }
	]
};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
	if (from_ver === undefined) {
		// Migrate legacy config file
		return Object.assign(Object.assign({}, DefaultSettings), settings);
	} else if (from_ver === null) {
		// No config file exists, use default settings
		return DefaultSettings;
	} else {
		// Migrate from older version (using the new system) to latest one
		switch (from_ver) {
			default:
				return DefaultSettings;
		}
	}
};