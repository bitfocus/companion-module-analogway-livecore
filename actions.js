module.exports = {

    /**
	* Get the available actions.
	*
	* @returns {Object[]} the available actions
	* @access public
	* @since 1.1.0
	*/

    getActions() {

        var actions = {
            
				/*
					Note: For self generating commands use option ids 0,1,...,5 and 'value'.
					The command will be of the form [valueof0],[valueof1],...[valueof5],[valueofvalue][CommandID]
					for set-commands you need a value, for get-commands you mustn't have a value
					for simple commands the value can be hardcoded in the CommandID, like "1SPtsl".
				*/
		'1SPtsl': {
			label: 'Take selected screens (Global take)'
		},
		'takescreen': {
			label: 'Take single screen',
			options: [{
				type: 'dropdown',
                label: 'Screen',
                id: 'screen',
                default: '0',
                choices: [
					{ id: '0', label: '1' },
					{ id: '1', label: '2' },
					{ id: '2', label: '3' },
					{ id: '3', label: '4' },
					{ id: '4', label: '5' },
					{ id: '5', label: '6' },
					{ id: '6', label: '7' },
					{ id: '7', label: '8' }
				]
			}]},
		'loadpreset': {
			label: 'Load Memory',
			options: [{
				type: 'textinput',
				label: 'Memory to load',
				id: 'memory',
				default: '1',
				tooltip: 'Enter the number of the memory you want to load from 1 to 144',
				regex: '/^0*([1-9]|[1-8][0-9]|9[0-9]|1[0-3][0-9]|14[0-4])$/'
			},{
				type: 'textinput',
				label: 'Destination screen',
				id: 'destscreen',
				default: '1',
				tooltip: 'Enter the number of the screen where the memory schould be loaded to (1 to 8)',
				regex: '/^0*[1-8]$/'
			},{
				type: 'dropdown',
				label: 'PGM/PVW',
				id: 'pgmpvw',
				default: '1',
				tooltip: 'Select wether the memory schould be loaded into the preview or program of the screen',
				choices: [ { id: '0', label: 'Program' }, { id: '1', label: 'Preview' }]
			},{
				type: 'dropdown',
				label: 'Scale enable',
				id: 'scale',
				default: '1',
				tooltip: 'Select wether the layers in the memory should be scaled according to the size of the screen if it is different from the size of the screen which the memory has been saved from.',
				choices: [ { id: '0', label: 'Do not scale' }, { id: '1', label: 'Enable scale' }]
			}]},
			'loadmaster': {
				label: 'Load Master Memory',
				options: [{
					type: 'textinput',
					label: 'Master Memory to load',
					id: 'memory',
					default: '1',
					tooltip: 'Enter the number of the master memory you want to load from 1 to 144',
					regex: '/^0*([1-9]|[1-8][0-9]|9[0-9]|1[0-3][0-9]|14[0-4])$/'
				},{
					type: 'dropdown',
					label: 'PGM/PVW',
					id: 'pgmpvw',
					default: '1',
					tooltip: 'Select wether the memory schould be loaded into the preview or program of the screens',
					choices: [ { id: '0', label: 'Program' }, { id: '1', label: 'Preview' }]
				},{
					type: 'dropdown',
					label: 'Scale enable',
					id: 'scale',
					default: '1',
					tooltip: 'Select wether the layers in the memory should be scaled according to the size of the screens if it is different from the size of the screens which the memory has been saved from.',
					choices: [ { id: '0', label: 'Do not scale' }, { id: '1', label: 'Enable scale' }]
				}]},
				'setfilter': {
				label: 'Set recall filter',
				options: [{
					type: 'dropdown',
					label: 'Layer source',
					id: 'filter1',
					default: '1',
					tooltip: 'Select wether the layer source should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude source' }, { id: '1', label: 'Include source' }]
				},{
					type: 'dropdown',
					label: 'Layer position and size',
					id: 'filter2',
					default: '1',
					tooltip: 'Select wether the layer position and size should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude position and size' }, { id: '1', label: 'Include position and size' }]
				},{
					type: 'dropdown',
					label: 'Layer transparency',
					id: 'filter4',
					default: '1',
					tooltip: 'Select wether the layer transparency should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude transparency' }, { id: '1', label: 'Include transparency' }]
				},{
					type: 'dropdown',
					label: 'Layer crop',
					id: 'filter8',
					default: '1',
					tooltip: 'Select wether the layer crop should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude crop' }, { id: '1', label: 'Include crop' }]
				},{
					type: 'dropdown',
					label: 'Layer border',
					id: 'filter16',
					default: '1',
					tooltip: 'Select wether the layer border apperance should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude border' }, { id: '1', label: 'Include border' }]
				},{
					type: 'dropdown',
					label: 'Layer transitions',
					id: 'filter32',
					default: '1',
					tooltip: 'Select wether the layer opening and closing transitions should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude transitions' }, { id: '1', label: 'Include transitions' }]
				},{
					type: 'dropdown',
					label: 'Layer effects',
					id: 'filter64',
					default: '1',
					tooltip: 'Select wether the layer effects should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude effects' }, { id: '1', label: 'Include effects' }]
				},{
					type: 'dropdown',
					label: 'Layer timing',
					id: 'filter128',
					default: '1',
					tooltip: 'Select wether the layer timing should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude timing' }, { id: '1', label: 'Include timing' }]
				},{
					type: 'dropdown',
					label: 'Layer speed',
					id: 'filter256',
					default: '1',
					tooltip: 'Select wether the layer speed should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude speed' }, { id: '1', label: 'Include speed' }]
				},{
					type: 'dropdown',
					label: 'Layer flying curve',
					id: 'filter512',
					default: '1',
					tooltip: 'Select wether the layer flying curve should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude flying curve' }, { id: '1', label: 'Include flying curve' }]
				},{
					type: 'dropdown',
					label: 'Native background',
					id: 'filter1024',
					default: '1',
					tooltip: 'Select wether the native background should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude native background' }, { id: '1', label: 'Include native background' }]
				},{
					type: 'dropdown',
					label: 'Layer mask',
					id: 'filter2048',
					default: '1',
					tooltip: 'Select wether the layer mask should be included in the memory recall.',
					choices: [ { id: '0', label: 'Exclude mask' }, { id: '1', label: 'Include mask' }]
			}]},
			'inputfreeze': {
				label: 'Freeze Input',
				options: [{
					type: 'textinput',
					label: 'Input',
					id: 'input',
					default: '1',
					tooltip: 'Enter the number of the input you want to adjust (1 to 12 for inputs of master device and 13 to 24 for inputs of slave device).',
					regex: '/^0*([1-9]|1[0-9]|2[0-4])$/'
				},{
					type: 'dropdown',
					label: 'Freeze Status',
					id: 'freeze',
					default: '0',
					tooltip: 'Select wether the input should be frozen or live.',
					choices: [ { id: '0', label: 'Unfrozen' }, { id: '1', label: 'Frozen' }]
			}]},
			'loadmonitoring': {
				label: 'Recall Monitoring Memory',
				options: [{
					type: 'textinput',
					label: 'Monitoring Memory to load',
					id: 'memory',
					default: '1',
					tooltip: 'Enter the number of the memory you want to load from 1 to 8',
					regex: '/^0*[1-8]$/'
				},{
					type: 'dropdown',
					label: 'Device',
					id: 'device',
					default: '0',
					tooltip: 'Select wether the monitoring memory schould be recalled on master or slave device in a stacked configuration. Leave at master for single configuration.',
					choices: [ { id: '0', label: 'Master' }, { id: '1', label: 'Slave' }]
			}]},
			'monitoringfullscreen': {
				label: 'Fullscreen Monitoring',
				options: [{
					type: 'textinput',
					label: 'Source to show',
					id: 'input',
					default: '1',
					tooltip: 'Enter the number of the source you want to show. 1 to 12 for inputs of master device, 13 to 24 for inputs of slave device, 25 to 40 for frames and logos of master and slave, 41 to 48 for screen 1 to 8 and 49 to 56 for preview 1 to 8.',
					regex: '/^0*([1-9]|[1-4][0-9]|5[0-6])$/'
				},{
					type: 'dropdown',
					label: 'Device',
					id: 'device',
					default: '0',
					tooltip: 'Select wether to switch the master or the slave device in stacked configuration.',
					choices: [ { id: '0', label: 'Master' }, { id: '1', label: 'Slave' }]
				},{
					type: 'dropdown',
					label: 'Fullscreen Status',
					id: 'fullscreen',
					default: '0',
					tooltip: 'Select wether the monitoring output should be in mosaic mode or fullscreen mode.',
					choices: [ { id: '0', label: 'Mosaic mode' }, { id: '1', label: 'Fullscreen Mode' }]
			}]},
			'selectscreens': {
				label: 'Select screens for global take',
				tooltip: 'Select the screens which schould transition with the global take command. The selection stays active until changed again.',
				options: [{
					type: 'dropdown',
					label: 'Screen 1',
					id: '0',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 2',
					id: '1',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 3',
					id: '2',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 4',
					id: '3',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 5',
					id: '4',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 6',
					id: '5',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 7',
					id: '6',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
				},{
					type: 'dropdown',
					label: 'Screen 8',
					id: '7',
					default: '0',
					choices: [ { id: '0', label: 'No change' }, { id: '1', label: 'Add to selection' }, { id: '2', label: 'Remove from selection' }]
			}]},
			'loadconfidence': {
				label: 'Load confidence Memory',
				options: [{
					type: 'textinput',
					label: 'Memory',
					id: 'memory',
					default: '',
					tooltip: 'Enter the number of the memory you want to load from 1 to 16',
					regex: '/^0*([1-9]|1[0-6])$/'
				},{
					type: 'textinput',
					label: 'Destination screen',
					id: 'destscreen',
					default: '1',
					tooltip: 'Enter the number of the screen where the memory schould be loaded to (1 to 8)',
					regex: '/^0*[1-8]$/'
			}]},
			'activateconfidence': {
				label: 'Switch confidence mode',
				options: [{
				type: 'textinput',
				label: 'Screen',
				id: 'destscreen',
				default: '1',
				tooltip: 'Enter the number of the screen where confidence mode should be switched (1 to 8)',
				regex: '/^0*[1-8]$/'
			},{
				type: 'dropdown',
				label: 'Mode',
				id: 'mode',
				default: '0',
				tooltip: 'Select wether confidence mode should be switched on or off at selected screen',
				choices: [ { id: '0', label: 'Off' }, { id: '1', label: 'On' }]
			}]},
			'switchplug': {
				label: 'Switch input plug',
				tooltip: 'Note that not all inputs may be available at your system and not all plugs are available at any input.',
				options: [{
				type: 'textinput',
				label: 'Input',
				id: 'input',
				default: '1',
				tooltip: 'Enter the number of the input where you want to switch the input plug (1 to 12 for inputs of master device and 13 to 24 for inputs of slave device).',
				regex: '/^0*([1-9]|1[0-9]|2[0-4])$/'
			},{
				type: 'dropdown',
				label: 'Plug',
				id: 'plug',
				default: '0',
				tooltip: 'Select the plug to use for that input',
				choices: [ { id: '0', label: 'Analog HD15 connector' }, { id: '1', label: 'Analog DVI-A connector' }, { id: '2', label: 'DVI' }, { id: '3', label: 'SDI' }, { id: '4', label: 'HDMI' }, { id: '5', label: 'DisplayPort' } ]
			}]},
			'sendcustomcommand': {
				label: 'Send custom command',
				options: [{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: '',
					tooltip: "Enter any command you like in plain ASCII. Beware of correct syntax, you mustn't enter the linebreak at the end of the command.",
					regex: '/^[\\w,]+$/i'
			}]}
        };
        return actions;
    }

}