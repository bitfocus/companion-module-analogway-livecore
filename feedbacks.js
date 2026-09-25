import { combineRgb } from '@companion-module/base'

/**
 * Get the available feedbacks.
 *
 * @returns {Object[]} the available feedbacks
 * @access public
 *
 */
export const getFeedbacks = (self) => {
	var feedbacks = {}

	feedbacks['input_used'] = {
		type: 'boolean',
		name: 'Source used',
		description: 'If a source is used in preset, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'number',
				label: 'Source',
				id: 'source',
				default: 1,
				min: 1,
				max: 48,
			},
			{
				type: 'dropdown',
				label: 'Preset (Program/Preview)',
				id: 'preset',
				choices: [
					{ id: 'pgm', label: 'Program' },
					{ id: 'pvw', label: 'Preview' },
					{ id: 'any', label: 'Any' },
				],
				default: 'pgm',
			},
		],
		callback: (feedback) => {
			if (
				(feedback.options.preset === 'pgm' || feedback.options.preset === 'any') &&
				self.tallyPGM[feedback.options.source]
			) {
				return true
			}
			if (
				(feedback.options.preset === 'pvw' || feedback.options.preset === 'any') &&
				self.tallyPVW[feedback.options.source]
			) {
				return true
			}
			return false
		},
	}

	feedbacks['input_frozen'] = {
		type: 'boolean',
		name: 'Input Freeze',
		description: 'If an input is frozen, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: '1',
				choices: self.getInputChoices(),
				allowInvalidValues: true, // e.g. a numeric local variable via expression
			},
		],
		callback: (feedback) => {
			return !!self.inputFrozen[Number(feedback.options.input) - 1]
		},
	}

	feedbacks['input_plug_active'] = {
		type: 'boolean',
		name: 'Input Plug Active',
		description: 'If a given plug is currently active on an input, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: '1',
				choices: self.getInputChoices(),
				allowInvalidValues: true, // e.g. a numeric local variable via expression
			},
			{
				type: 'dropdown',
				label: 'Plug',
				id: 'plug',
				default: '0',
				allowInvalidValues: true,
				choices: [
					{ id: '0', label: 'Analog VGA connector' },
					{ id: '1', label: 'Analog DVI-A connector' },
					{ id: '2', label: 'DVI' },
					{ id: '3', label: 'SDI' },
					{ id: '4', label: 'HDMI' },
					{ id: '5', label: 'DisplayPort' },
				],
			},
		],
		callback: (feedback) => {
			return self.inputActivePlug[Number(feedback.options.input) - 1] === Number(feedback.options.plug)
		},
	}

	feedbacks['recall_filter_active'] = {
		type: 'boolean',
		name: 'Recall Filter Active',
		description: 'If a given aspect is currently included in the memory recall filter, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Filter',
				id: 'filter',
				default: '1',
				choices: [
					{ id: '1', label: 'Layer source' },
					{ id: '2', label: 'Layer position and size' },
					{ id: '4', label: 'Layer transparency' },
					{ id: '8', label: 'Layer crop' },
					{ id: '16', label: 'Layer border' },
					{ id: '32', label: 'Layer transitions' },
					{ id: '64', label: 'Layer effects' },
					{ id: '128', label: 'Layer timing' },
					{ id: '256', label: 'Layer speed' },
					{ id: '512', label: 'Layer flying curve' },
					{ id: '1024', label: 'Native background' },
					{ id: '2048', label: 'Layer mask' },
				],
			},
		],
		callback: (feedback) => {
			return (self.recallFilter & Number(feedback.options.filter)) !== 0
		},
	}

	feedbacks['monitoring_fullscreen_active'] = {
		type: 'boolean',
		name: 'Fullscreen Monitoring Active',
		description: 'If the monitoring output is in fullscreen mode, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Device',
				id: 'device',
				default: '0',
				tooltip: 'Select wether to check the master or the slave device in stacked configuration.',
				choices: [
					{ id: '0', label: 'Master' },
					{ id: '1', label: 'Slave' },
				],
			},
			{
				type: 'dropdown',
				label: 'Source to check',
				id: 'source',
				default: 'any',
				choices: [{ id: 'any', label: 'Any (just check fullscreen is active)' }, ...self.getMonitoringSourceChoices()],
				allowCustom: true,
				allowInvalidValues: true,
				tooltip:
					'1 to 12 for inputs of master device, 13 to 24 for inputs of slave device, 25 to 40 for frames and logos of master and slave, 41 to 48 for screen 1 to 8 and 49 to 56 for preview 1 to 8.',
			},
		],
		callback: (feedback) => {
			const device = Number(feedback.options.device)
			if (!self.monitoringFullscreen[device]) return false
			if (feedback.options.source === 'any' || feedback.options.source === '') return true
			return self.monitoringFullscreenSource[device] === parseInt(feedback.options.source) - 1
		},
	}

	feedbacks['memory_active'] = {
		type: 'boolean',
		name: 'Memory active',
		description: 'If a screen memory is loaded in preset, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'number',
				label: 'Screen Memory',
				id: 'memory',
				default: 1,
				min: 1,
				max: 144,
			},
			{
				type: 'dropdown',
				label: 'Screen',
				id: 'screen',
				default: 'any',
				choices: [
					{ id: 'any', label: 'Any' },
					{ id: 1, label: '1' },
					{ id: 2, label: '2' },
					{ id: 3, label: '3' },
					{ id: 4, label: '4' },
					{ id: 5, label: '5' },
					{ id: 6, label: '6' },
					{ id: 7, label: '7' },
					{ id: 8, label: '8' },
				],
				allowCustom: true,
				allowInvalidValues: true,
				tooltip:
					'To require several screens at once (true only if the memory is active on all of them), type them directly (or via an expression, e.g. a variable) - either concatenated, e.g. "S1S2", or separated, e.g. "1, 2".',
			},
			{
				type: 'dropdown',
				label: 'Preset (Program/Preview)',
				id: 'preset',
				choices: [
					{ id: 'pgm', label: 'Program' },
					{ id: 'pvw', label: 'Preview' },
					{ id: 'any', label: 'Any' },
				],
				default: 'pgm',
			},
		],
		callback: (feedback) => {
			const screenMatches = (screen) => {
				if (
					(feedback.options.preset === 'pgm' || feedback.options.preset === 'any') &&
					self.memoriesPGM[screen] === feedback.options.memory - 1
				) {
					return true
				}
				if (
					(feedback.options.preset === 'pvw' || feedback.options.preset === 'any') &&
					self.memoriesPVW[screen] === feedback.options.memory - 1
				) {
					return true
				}
				return false
			}

			if (feedback.options.screen === 'any') {
				return Array.from({ length: 8 }, (_, s) => s).some(screenMatches)
			}
			if (typeof feedback.options.screen === 'number') {
				// 1-based, like the choice ids and every other screen field - see the UpgradeScript
				// that migrates configs saved before this was fixed from its old 0-based numbering.
				return screenMatches(feedback.options.screen - 1)
			}
			// An expression selecting several screens at once (e.g. "S1S2") - true only if all of them match.
			const screens = self.parseScreenNumbers(feedback.options.screen)
			return screens.length > 0 && screens.every((s) => screenMatches(s - 1))
		},
	}

	feedbacks['screen_active'] = {
		type: 'boolean',
		name: 'Screen selected for global take',
		description: 'If a screen for global take is selected, change the style of the button',
		defaultStyle: {
			color: 0xffffff,
			bgcolor: combineRgb(200, 0, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Screen',
				id: 'screen',
				default: 1,
				choices: [
					{ id: 1, label: '1' },
					{ id: 2, label: '2' },
					{ id: 3, label: '3' },
					{ id: 4, label: '4' },
					{ id: 5, label: '5' },
					{ id: 6, label: '6' },
					{ id: 7, label: '7' },
					{ id: 8, label: '8' },
				],
				allowCustom: true,
				allowInvalidValues: true,
				tooltip:
					'To require several screens at once (true only if all of them are selected), type them directly (or via an expression, e.g. a variable) - either concatenated, e.g. "S1S2", or separated, e.g. "1, 2".',
			},
		],
		callback: (feedback) => {
			const screenSelected = (screen) => !!self.activeScreen[screen]

			if (typeof feedback.options.screen === 'number') {
				// 1-based, like every other screen field - see the UpgradeScript that migrates
				// configs saved before this was fixed from its old 0-based numbering.
				return screenSelected(feedback.options.screen - 1)
			}
			// An expression selecting several screens at once (e.g. "S1S2") - true only if all of them match.
			const screens = self.parseScreenNumbers(feedback.options.screen)
			return screens.length > 0 && screens.every((s) => screenSelected(s - 1))
		},
	}

	return feedbacks
}
