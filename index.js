module.exports = class mod {
	constructor(mod) {
		mod.loadSettings()

		const balloonDenylist = new Set(require("./lib/npcBalloonData.json").map(String))

		const colors = {
			yellow: "#e8dd13",
			blue: "#26adf0",
			green: "#449e48",
			l_green: "#69ff61",
			red: "#e3242b",
			l_red: "#ff6961",
			white: "#ffffff"
		}

		const HEX_PATTERN = /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$|^#[0-9a-f]{8}$/i

		const clr = new Proxy(colors, {
			get(color, key) {
				const hex = HEX_PATTERN.test(key) ? key : color[key]
				return (text) => `<FONT color="${hex}">${text}</FONT>`
			}
		})

		function isSilencedNpc(huntingZoneId, templateId) {
			return mod.settings.silencedNpcList.some((npc) => npc.huntingZoneId === huntingZoneId && npc.templateId === templateId)
		}

		function unsilenceNpc(huntingZoneId, templateId) {
			const npcIndex = mod.settings.silencedNpcList.findIndex((npc) => npc.huntingZoneId === huntingZoneId && npc.templateId === templateId)

			if (npcIndex === -1) {
				return mod.command.message(`${clr.l_red("NPC")} [hzId: ${huntingZoneId}, tId: ${templateId}] ${clr.l_ured("is not silenced.")}`)
			}

			mod.settings.silencedNpcList.splice(npcIndex, 1)
		}

		function updateSettings(message, save = true, load = true) {
			if (save) mod.saveSettings()
			if (load) mod.loadSettings()
			mod.command.message(message)
		}

		mod.hook("S_SPAWN_NPC", "*", { order: 10, filter: { fake: null, modified: null, silenced: false } }, (event) => {
			if (mod.settings.debugEnabled) {
				mod.command.message(`${clr.white("[Debug]")}: (hzId: ${event.huntingZoneId}, tId: ${event.templateId})`)
			}

			if (!mod.settings.dialogEnabled || !event.villager) return

			const shouldOverride = mod.settings.dungeonOverrideEnabled && mod.game.me.inDungeon

			event.visible = !isSilencedNpc(event.huntingZoneId, event.templateId) || shouldOverride
			return true
		})

		mod.hook("S_QUEST_BALLOON", "*", { order: 10, filter: { fake: null, modified: null, silenced: false } }, (event) => {
			const shouldOverride = mod.settings.dungeonOverrideEnabled && mod.game.me.inDungeon
			if (mod.settings.balloonEnabled && balloonDenylist.has(event.message.match(/@monsterBehavior:(\d+)/)?.[1]) && !shouldOverride) return false
		})

		mod.hook("S_DIALOG", "*", (event) => {
			if (mod.settings.debugEnabled) mod.command.message(`${clr.white("[Debug]")}: (hzId: ${event.key2}, tId: ${event.key1})`)
		})

		mod.command.add("mutenpc", {
			dialog() {
				mod.settings.dialogEnabled = !mod.settings.dialogEnabled
				updateSettings(`${mod.settings.dialogEnabled ? `${clr.green("Silencing")}` : `${clr.red("Allowing")}`} NPC dialog chat messages.`, true, false)
			},
			balloon() {
				mod.settings.balloonEnabled = !mod.settings.balloonEnabled
				updateSettings(`${mod.settings.balloonEnabled ? `${clr.green("Silencing")}` : `${clr.red("Allowing")}`} NPC balloon chat messages.`, true, false)
			},
			dungeon() {
				mod.settings.dungeonOverrideEnabled = !mod.settings.dungeonOverrideEnabled
				updateSettings(`Dungeon override ${mod.settings.dungeonOverrideEnabled ? `${clr.green("enabled")}. All NPC messages will be ${clr.l_green("shown")} while in dungeons.` : `${clr.red("disabled")}. NPC Messages will be ${clr.l_red("blocked")} according to configuration.`}`, true, false)
			},
			add(huntingZoneId, templateId, ...name) {
				huntingZoneId = Number(huntingZoneId), templateId = Number(templateId), name = name.join(" ").toString()

				if (!Number.isInteger(huntingZoneId) || !Number.isInteger(templateId)) {
					return mod.command.message(`${clr.l_red("Invalid input")}. Usage: !mutenpc add [huntingZoneId] [templateId] [name (optional)].`)
				}

				if (isSilencedNpc(huntingZoneId, templateId)) {
					unsilenceNpc(huntingZoneId, templateId)
				}

				mod.settings.silencedNpcList.push({ name, huntingZoneId, templateId })

				updateSettings(`${clr.white("Silenced NPC")}: [hzId: ${huntingZoneId}, tId: ${templateId}${name ? ` (${name})` : ""}]`)
			},
			remove(huntingZoneId, templateId) {
				huntingZoneId = Number(huntingZoneId), templateId = Number(templateId)

				if (!Number.isInteger(huntingZoneId) || !Number.isInteger(templateId)) {
					return mod.command.message(`${clr.l_red("Invalid input")}. Usage: !mutenpc remove [huntingZoneId] [templateId].`)
				}

				unsilenceNpc(huntingZoneId, templateId)
				updateSettings(`${clr.white("Unsilenced NPC")}: [hzId: ${huntingZoneId}, tId ${templateId}].`)
			},
			debug() {
				mod.settings.debugEnabled = !mod.settings.debugEnabled
				updateSettings(`Debug mode ${mod.settings.debugEnabled ? `${clr.green("enabled")}` : `${clr.red("disabled")}`}.`, true, false)
			},
			help() {
				[
					`${clr.yellow("Commands:")}`,
					`${clr.blue("!mutenpc dialog")}:\n - ${clr.white("Toggles visibility of villager dialog messages")}. \nCurrent status: ${mod.settings.dialogEnabled ? `${clr.green("Silencing")}` : `${clr.red("Showing")}`} NPC chat messages.`,
					`${clr.blue("!mutenpc balloon")}:\n - ${clr.white("Toggles visibility of monster behavior messages")}. \nCurrent status: ${mod.settings.balloonEnabled ? `${clr.green("Silencing")}` : `${clr.red("Showing")}`} NPC chat messages.`,
					`${clr.blue("!mutenpc dungeon")}:\n - ${clr.white("Toggles dungeon override for NPC chat messages")}. \nCurrent status: ${mod.settings.dungeonOverrideEnabled ? `${clr.l_green("Allowing all NPC chat messages")}` : `${clr.l_red("Following standard configuration")}.`}`,
					`${clr.blue("!mutenpc add")} [huntingZoneId] [templateId] [name (optional)]:\n - ${clr.white("Silences an NPC's chat messages")}.`,
					`!${clr.blue("mutenpc remove")} [huntingZoneId] [templateId]:\n - ${clr.white("Unsilences an NPC's chat messages")}.`,
					`${clr.blue("!mutenpc debug")}:\n - ${clr.white("For power users. Toggles logging of")} [huntingZoneId, templateId] ${clr.white("on NPC spawn and interaction")}. \nCurrent status: ${mod.settings.debugEnabled ? `${clr.green("enabled")}` : `${clr.red("disabled")}`}`,
					`${clr.blue("!mutenpc help")}:\n - ${clr.white("Displays a list of valid commands for this mod")}.`
				].forEach((line) => mod.command.message(line))
			},
			$default() {
				mod.command.message(`${clr.l_red("Invalid input")}. Type ${clr.blue("!mutenpc help")} for a refresher on valid commands.`)
			}
		})
	}
}