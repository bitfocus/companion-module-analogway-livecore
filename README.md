# companion-module-analogway-livecore  
With this module you can control all graphic switchers from the Livecore series by Analog Way.

See HELP.md and LICENSE

## Version History

### 3.0.0 (2026-09-10)
* major: require Companion v5.1+ (upgraded to @companion-module/base v2.2, Node 26 runtime)
* fix: PGM/PVW memory feedback finally works after all those years
* fix: config save no longer crashes the connection
* fix: several old bugs where ass-kicked
* fix: connection could look "connected" while actually dead after a quick reconnect - now catches itself and recovers automatically
* fix: screen numbering via expressions was off by one on a few actions/feedbacks - fixed, existing buttons migrate automatically
* feature: screen, memory, master memory, confidence memory, monitoring memory and input options are now dynamic, named dropdowns instead of free-text numbers
* feature: multiple screens at once via expression (e.g. `S1S2`) on take/select/load/confidence actions and feedbacks
* feature: a bunch of new feedbacks - input freeze, input plug, recall filter, fullscreen monitoring
* feature: a whole library of ready-made presets that build themselves from whatever's actually on your rig - drag, drop, done
* feature: global take selection gained a toggle option and a single-screen action
* feature: connected device is auto-detected and shown in the config instead of a manual picker
* feature: lots of new variables (memory/master memory/input names, active plug, monitoring source names, global take selection, ...)
* change: connects on port 10500 instead of a user-selectable port due to getting valid feedbacks
* change: `device.*` variables renamed to `Device.*` for consistency - update button text that used the old names

### 2.0.0 (2023-06-11)
* major: rewrite for Companion v3 compatibility
* feature: add feedbacks for source tally, memory tally and screen selection
* feature: add variables parsing for custom command
