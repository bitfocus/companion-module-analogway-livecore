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
				(feedback.options.preset === pgm || feedback.options.preset === any) &&
				self.tallyPGM[feedback.options.source]
			) {
				return true
			}
			if (
				(feedback.options.preset === pvw || feedback.options.preset === any) &&
				self.tallyPVW[feedback.options.source]
			) {
				return true
			}
			return false
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
				max: 119,
			},
			{
				type: 'dropdown',
				label: 'Screen',
				id: 'screen',
				default: 'any',
				choices: [
					{ id: 'any', label: 'Any' },
					{ id: 0, label: '1' },
					{ id: 1, label: '2' },
					{ id: 2, label: '3' },
					{ id: 3, label: '4' },
					{ id: 4, label: '5' },
					{ id: 5, label: '6' },
					{ id: 6, label: '7' },
					{ id: 7, label: '8' },
				],
			},
			{
				type: 'dropdown',
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
			if (feedback.options.screen === 'any') {
				if (
					(feedback.options.preset === 'pgm' || feedback.options.preset === 'any') &&
					self.memoriesPGM.some((mem) => mem === feedback.options.memory - 1)
				) {
					return true
				}
				if (
					(feedback.options.preset === 'pvw' || feedback.options.preset === 'any') &&
					self.memoriesPVW.some((mem) => mem === feedback.options.memory - 1)
				) {
					return true
				}
			} else {
				if (
					(feedback.options.preset === 'pgm' || feedback.options.preset === 'any') &&
					self.memoriesPGM[feedback.options.screen] === feedback.options.memory - 1
				) {
					return true
				}
				if (
					(feedback.options.preset === 'pvw' || feedback.options.preset === 'any') &&
					self.memoriesPVW[feedback.options.screen] === feedback.options.memory - 1
				) {
					return true
				}
			}
			return false
		},
	}

	feedbacks['screen_active'] = {
		type: 'boolean',
		name: 'Screen selected',
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
				default: 0,
				choices: [
					{ id: 0, label: '1' },
					{ id: 1, label: '2' },
					{ id: 2, label: '3' },
					{ id: 3, label: '4' },
					{ id: 4, label: '5' },
					{ id: 5, label: '6' },
					{ id: 6, label: '7' },
					{ id: 7, label: '8' },
				],
			},
		],
		callback: (feedback) => {
			if (self.activeScreen[feedback.options.screen]) {
				return true
			}
			return false
		},
	}

	return feedbacks
}
