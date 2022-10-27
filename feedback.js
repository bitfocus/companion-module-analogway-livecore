const feedback = require('companion-module-irisdown-countdowntimer/feedback')

module.exports = {
	/**
	 * Get the available feedbacks.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access public
	 *
	 */

	getFeedbacks() {
		var feedbacks = {}

		feedbacks['input_active'] = {
			type: 'boolean',
			label: 'Change style from program source',
			description: 'If a source is visible in the program, change the style of the button',
			style: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(200, 0, 0),
			},
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					type: 'number',
					label: 'Source',
					id: 'source',
					default: 1,
					min: 1,
					max: 48,
				},
			],
		}

		feedbacks['input_previewed'] = {
			type: 'boolean',
			label: 'Change style from preview source',
			description: 'If a source is enabled in the preview scene, change the style of the button',
			style: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 200, 0),
			},
			// options is how the user can choose the condition the feedback activates for
			options: [
				{
					type: 'number',
					label: 'Source',
					id: 'source',
					default: 1,
					min: 1,
					max: 48,
				},
			],
		}

		feedbacks['screen_active'] = {
			type: 'boolean',
			label: 'Change style from screen selected',
			description: 'If a screen for global take is selected, change the style of the button',
			style: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(200, 0, 0),
			},
			// options is how the user can choose the condition the feedback activates for
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
		}

		return feedbacks
	},
}
