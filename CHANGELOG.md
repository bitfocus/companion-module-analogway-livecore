# Changelog

## 3.0.0 — Maintenance, Companion v2 update, feedbacks and presets (September 2026)

A big maintenance and feature pass on the module, covering everything since the last release published on the original bitfocus repository (2.0.0). Existing shows keep working — same actions, same buttons — but the module now tracks the switcher's actual state correctly, offers a lot more feedbacks and variables, stops asking you to type numbers you'd otherwise have to look up, and ships a full set of ready-to-use presets.

### Fixed

These were not edge cases — they affected the core feedback loop of running a show.

- **Program/Preview feedback is trustworthy after a Take.** The "which memory is live" feedback used to go stale the moment you took a screen — it kept showing the pre-take state. It now tracks the T-bar position itself, so PGM/PVW feedback stays correct through takes, not just through loads.
- **Confidence screens could get stuck.** Switching a screen into Confidence mode made it vanish from every screen picker, with no way to select it again to switch it back. Confidence screens now stay selectable everywhere it matters.
- **Saving the connection config no longer crashes it.** Changing the IP address and saving used to throw the module into an error state instead of reconnecting.
- **"Source used" feedback works instead of erroring.** This feedback (highlighting a button when its source is on air) was broken at a code level and never actually evaluated.
- **The connection no longer garbles itself under load.** A bug in how the module read data off the wire meant that whenever the switcher sent several status lines back-to-back, everything after the first line could get corrupted and silently dropped — very likely the cause of assorted "it just stops updating" issues.
- **Screens addressed via expression were off by one.** "Take one or more screens" and "Select screen(s) for global take" showed "S1" in their dropdown but stored it internally as 0 — typing "1" via an expression actually hit screen 2. Fixed to be 1-based everywhere, matching every other screen field.
- **"Memory active" and "Screen selected" feedbacks had the same off-by-one.** Picking "2" from the Screen list actually checked screen 3. Existing buttons are migrated automatically to the corrected numbering, so already-configured feedbacks keep pointing at the same screen.
- **The connection can get stuck looking "connected" while actually dead.** A quick reconnect — a dev-reload, a network blip, the module's own automatic retry — could leave the switcher not sending its usual greeting, so the module never started talking to it again even though the TCP socket looked fine. It's now caught and recovered from automatically (see "Connection reliability" below).
- **The full state query on connect could overwhelm the switcher.** Reading everything back after connecting is close to 800 individual commands; firing them all in one burst could cause some responses to be lost, leaving a few variables never populated. They're now sent in small, paced batches instead.
- Fixed the master-memory range in the "Memory active" feedback (was capped at 119 instead of 144).
- **Renamed memories now update their labels.** A memory saved over with a new name kept showing its old name in dropdowns, variables and presets until the next reconnect — names are now re-read whenever the switcher announces a save.
- Connecting to the slave unit of a stacked pair (instead of the master) crashed the module rather than reporting the mistake.
- A single malformed line from the switcher could take the whole module down; it's now logged and skipped instead.
- The state query on connect ran twice per connection (once triggered by our own request, once by the switcher's greeting) — it now runs once.
- Disabling or reloading the module while it was still busy talking to the switcher could leave a stray connection open, occupying one of the switcher's five controller slots.

### Added

- **Named, filtered dropdowns everywhere a number used to go.** Screens, regular memories, master memories, confidence memories, monitoring memories, and inputs are now all populated live from the device, labelled with their real names, and limited to what actually exists on your rig.
  - Screens show as e.g. `S2 – Livestream`.
  - Master Memory and regular Memory only list slots that actually have something saved to them (this was previously only possible for Master Memory).
  - Inputs show as e.g. `3 – SDI – Playout-Fill` (number, active connector, name), and selecting one also lists which connectors are physically available on it.
  - "Fullscreen Monitoring"'s source field is a named dropdown too, covering inputs, frames/logos, and program/preview of every screen — instead of asking for a raw 1–56 number.
- **Multi-screen selection via expression.** "Take", "Select screen for global take", the destination screen on "Load Memory"/"Load confidence Memory", "Switch confidence mode", and the "Memory active"/"Screen selected" feedbacks now all accept more than one screen at once — either concatenated (`S1S2`) or separated (`1, 2`) — with AND logic for the feedbacks (true only if every listed screen matches). Plain single-screen use is unaffected.
- **"Freeze Input" gained a Toggle option**, alongside the existing Frozen/Unfrozen choices.
- **New feedbacks:**
  - Input Freeze — whether a given input is currently frozen.
  - Input Plug Active — whether a given connector is the currently active one on an input.
  - Recall Filter Active — whether a given aspect (position, transparency, border, timing, …) is currently included when recalling a memory.
  - Fullscreen Monitoring Active — whether the monitoring output is in fullscreen mode, optionally for a specific source.
  - Screen selected (for global take) and Memory active now also support the multi-screen expression syntax above.
- **A full library of ready-made presets**, so most buttons for a show can be dragged in rather than built from scratch:
  - Load Memory to Screen, and Load Master Memory — one preset per screen/memory actually present on the rig.
  - Switch Input Plug — one per input, limited to the connectors actually available on it.
  - Recall Monitoring Memory — all 8, named where known.
  - Fullscreen Monitoring (show source) — every input, frame/logo, and screen program/preview currently available.
  - Freeze Input — one per existing input.
  - Select Screen for global take — one per available screen.
  - Take Screen, Global Take, and Monitoring Mosaic Mode as single reusable templates.
  - All of the above regenerate live as memories get saved, screens come online, or a slave device gets linked — no need to reconnect to see new ones appear.
- **Connection reliability.** A watchdog actively checks the connection is still genuinely alive (not just "connected"-looking) and reconnects if it's gone quiet, a one-time safety reconnect shortly after startup catches anything the first attempt might have missed, and the module now proactively starts talking to the switcher on connect instead of waiting for a greeting that isn't always sent in time. Together these mean a network blip or a switcher reboot should recover on their own, without needing to manually toggle the connection.
- **Global Take selection gained a toggle.** The existing multi-screen selection action now has a "toggle" option alongside add/remove, and there's a new single-screen action for building per-screen toggle buttons.
- **Connected device auto-detection.** The connection settings no longer have a manual "which model" picker — the module now shows what it actually detected (model name, and whether it's talking to the AW_SIMULATOR).
- **New variables:**
  - Per screen: T-bar position (`up`/`down`), name, memory loaded in Program/Preview, global-take-selection status, confidence-screen status, resolution (width × height).
  - Per output: name, active status, HDCP status.
  - Per regular/master memory: name (`SM{n}.label` / `MM{n}.label`), only for slots that actually have something saved.
  - Per input: name (`Input{n}.label`) and currently active connector (`Input{n}.activeplug`).
  - Per fullscreen-monitoring source (1–56) and per connector type: a name lookup (`MonitoringSource{n}.label`, `Plug{n}.label`) for building your own button text.
  - `GlobalTake.selection` — the screens currently selected for global take, formatted as e.g. `S1S2`.
  - Device: firmware version, connected controller count, fan alarm, temperature alarm, ready status.

### Changed

- **Connects on port 10500 instead of 10600**, and the port is no longer user-configurable. Port 10500 is the richer channel the operator panel itself uses; it's what makes live T-bar tracking and the named dropdowns possible. Existing connections pick this up automatically on update.
- **Upgraded `@companion-module/base` from `~1.4.1` to `^2.1.3`** (and `@companion-module/tools` to `^3.1.0`). Requires **Companion 4.3 or newer** — installations on an older Companion release should stay on the previous module version. This also puts the module's fields on Companion's current expression system going forward.
- **Device variables renamed to a consistent `Device.*` capitalisation** (was `device.*`), matching every other variable in the module. Any button text already referencing e.g. `device.firmware` will need updating to `Device.firmware`.

### Internal

- Migrated the module entrypoint from `runEntrypoint()` to a default export + named `UpgradeScripts` export (required by base v2).
- `setVariableDefinitions` now uses the v2 object-keyed format instead of an array.
- Removed `context.parseVariablesInString()` in favour of Companion resolving `useVariables` fields before the action callback runs.
- `companion/manifest.json`: `runtime.type` updated to `node22`; added the now-required top-level `"type": "connection"` field.
- Upgraded module tooling to Yarn 4.17.0 with a pinned `packageManager`, matching bitfocus's current module template.
- Added a GitHub Actions CI workflow (lint/build) and a husky pre-commit hook.
