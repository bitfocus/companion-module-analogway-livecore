exports.getPresets = function () {
    let presets = []
    const foregroundColor = this.rgb(255, 255, 255)
    const backgroundColor = this.rgb(0, 0, 0)

    /**
	 * Take
	 */
	presets.push({
		category: 'Global Take',
		label: 'TAKE',
		bank: {
			style: 'text',
			text: 'TAKE',
			size: '24',
			color: foregroundColor,
			bgcolor: this.rgb(255, 0, 0),
		},
		actions: [
			{
				action: 'globaltake',
			},
		],
	})

        /**
         * Select screen
         */
        presets.push({
            category: 'Global Take',
            label: 'Select screen 1',
            bank: {
                style: 'text',
                text: 'S1',
                size: 'auto',
                color: foregroundColor,
                bgcolor: backgroundColor,
                latch : true,
            },
            actions: [{
                action: 'selectscreens',
                options: {
                    0:1
                },
            }],
            release_actions: [{
                action: 'selectscreens',
                options: {
                    0:2,
                }
            }],
            feedbacks: [{
                type: 'screen_active',
                options: {
                    screen: 0,
                },
                style: {
                    color: this.rgb(255, 255, 255),
                    bgcolor: this.rgb(200, 0, 0),
                },
            }],
        })   

    // //create presets for each screen

    // this.screens.forEach((element) => {

    //     /**
    //      * Select screen
    //      */
    //     presets.push({
    //         category: 'Global Take',
    //         label: 'Select screen' + element.label,
    //         bank: {
    //             style: 'text',
    //             text: element.label,
    //             size: 'auto',
    //             color: foregroundColor,
    //             bgcolor: backgroundColor,
    //             latch : true,
    //         },
    //         actions: [{
    //             action: 'selectscreens',
    //             options: {
    //                 0:'1',
    //             },
    //         }],
    //         release_Actions: [{
    //             action: 'selectscreens',
    //             options: {
    //                 element.id:'2',
    //             }
    //         }],
    //         feedbacks: [{
    //             type: 'screen_active',
    //             options: {
    //                 screen: element.id,
    //             },
    //             style: {
    //                 color: this.rgb(255, 255, 255),
    //                 bgcolor: this.rgb(200, 0, 0),
    //             },
    //         }],
    //     })   

    // })

    return presets
}