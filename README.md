# npc-message-silencer
Controls visibility of NPC dialog chat messages based on configured entries. Supports blocking villagerDialog messages and monsterBehavior messages.

![image](https://i.imgur.com/e4Rvb4S.png)
***
## How it Works
The typical annoying NPC dialog messages that clutter your chat window are mainly controlled from two areas:
- Dialog messages sent when the NPC spawns (like when using premium Summon NPC skills) are read from the DataCenter's specific `VillagerDialog` XML file that contains the NPC's `huntingZoneId` and `templateId`. These messages are handled internally, which means they cannot be modified or blocked with standard chat message packet interception. Instead, we look at  the packet `S_SPAWN_NPC` to modify; if the `visible` boolean for a given NPC is set to `false`, the messages don't show up.

- Dialog messages sent when certain conditions have been met (such as when your summoned NPCs are about to expire) are read from the DataCenter's `StrSheet_MonsterBehavior` XML file. In this case, there is no elegant way of only blocking certain messages without sorting it out manually. Instead, all string entries are filtered based on whether it contains the attribute `onlyBalloon="true"` -- when set to `true`, the respective message is not sent to the chat. So, we blanket-block all entries that either did not contain the `onlyBalloon` attribute, or had it set to `false`. Then, we look at the packet `S_QUEST_BALLOON`, match whether the message comes from the `MonsterBehavior` string sheet, and then check whether we should block it. If the `event.message` doesn't contain any of the allowed IDs from our `npcBalloonData.json`, we block it.
***
## Configuration and Usage
This mod only silences all of the premium NPC summons' (including Malo and Mimi) `VillagerDialog` messages by default. In the case of `monsterBehavior` messages, the mod blanket-blocks *all* `S_QUEST_BALLOON` messages that are not balloon only.

Both types of silencing can be individually toggled on or off. There is also a dungeon-specific override in the event of any unforeseen circumstance or unintended interactions with dungeon mechanics. By default, the dungeon override is disabled.

This mod supports silencing or unsilencing of additional NPCs based on user input. You are in full control over the messages you are able to see. NPCs can be added/removed to the silence list with the following command usage: `!mutenpc add/remove [huntingZoneId] [templateId]`, or can be added/removed manually through raw `config.json` file manipulation.

All packet hooks are installed at `order: 10`, slightly above standard hook order. This is done purposefully to avoid messing with other potential mods that hook the same packets. Mods that hook the same packets at lower or standard orders will not have their data modified by this mod.

### Commands
> [!TIP]
> Ignore the `!` prefix if typing a command into the Noctenium `/8` chat.

| Prefix | Argument(s) | Example | Description |
| ------- | ----------- | ------- | ----------- |
| !mutenpc | dialog | "!mutenpc dialog" | Toggles silencing of `villagerDialog` NPC chat messages. On by default.
| !mutenpc | balloon | "!mutenpc balloon" | Toggles silencing of `monsterBehavior` NPC balloon chat messages. On by default.
| !mutenpc | dungeon | "!mutenpc dungeon" | Toggles override for NPC chat messages while in dungeons.  Off by default.
| !mutenpc | add [huntingZoneId] [templateId] [name (optional)] | "!mutenpc add 63 1962 Mimi" | Adds a specified NPC to the list of silenced NPCs. 
| !mutenpc | remove [huntingZoneId] [templateId] | "!mutenpc remove 63 1962" | Removes a specified NPC from the list of silenced NPCs.
| !mutenpc | debug | "!mutenpc debug" | Toggles logging of [huntingZoneId, templateId] on NPC spawn and interaction. Useful for power-users to grab IDs to (un)silence NPCs with. Off by default.
| !mutenpc | help | "!mutenpc help" | Prints a list of all available module commands.

### File Structure
When this module is intialized for the first time, a default `config.json` file is generated inside the `/lib/` folder using the DEFAULT_SETTINGS contained within `config_generator.js` located in the same directory. Configuration settings are automatically saved and loaded whenever the user makes a change.

The list of `monsterBehavior` message IDs to compare silencing against is located inside `/lib/npcBalloonData.json/`. As of mod release, This list contains all message IDs that are balloon only. You're free to edit this file manually if you know what you're doing. Array elements removed from this file will be unsilenced.

## Safety
> [!CAUTION]
> Don't download and use mods that you can't personally verify are safe. I recommend that everyone look at all mods they intend on using and determine whether or not they're safe to use. When in doubt, **DON'T USE IT!**

> [!IMPORTANT]
> This module does not in any way craft or send packets to your client or the game server. One packet (`S_SPAWN_NPC`) is modified to control a boolean value, and specific instances of one packet (`S_QUEST_BALLOON`) are prevented from being received by your client.
> In simple terms, this mod should be completely safe to use and shouldn't violate any community rules.

None of the modules released by me will ever be auto-update compatible unless specifically required. The module that you download from this repository will remain as-is forever. In the event of a module update, users are required to manually update the mod themselves, which for this mod, shouldn't ever be required.
