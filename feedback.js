module.exports = {
	/**
	 * Get the available feedbacks.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access public
	 * @since 1.1.0
	 */

	getFeedbacks() {
		var feedbacks = {}

		feedbacks['input_active'] = {
			type: 'boolean',
			label: 'Input Visible in Program',
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
				},
			],
		}

		feedbacks['input_previewed'] = {
			type: 'boolean',
			label: 'Input Visible in Preview',
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
				},
			],
		}

		return feedbacks
	},
}
