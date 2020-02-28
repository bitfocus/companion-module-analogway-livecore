var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	this.firmwareVersion = "0";
	this.numOutputs = 0;
	this.numInputs = 0;
	this.modelnum;
	this.modelname = '';

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}


instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
			self.sendcmd("");
		});

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {
			var i = 0, line = '', offset = 0;
			receivebuffer += chunk;
			while ( (i = receivebuffer.indexOf('\r\n', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 1;
				self.socket.emit('receiveline', line.toString());
			}
			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function (line) {
			debug("Received line from Livecore:", line);

			if (line.match(/TPcon\d,\d+/)) {
				if (line.match(/TPcon0,\d+/) == null) {
					self.log('error',"Connected to "+ self.config.label +", but this is not the master of stacked configuation! Closing connection now.");
					self.socket.destroy();
				}
					var connectedDevices = parseInt(line.match(/TPcon0,(\d)/)[1]);
					if (connectedDevices < 4) {
						self.log('info',self.config.label +" has " + (connectedDevices-1) + " other connected controller(s).");
						self.sendcmd("?");
					}	else if (connectedDevices == 4) {
						self.log('warn',self.config.label +" has 4 other connected controllers. Maximum reached.");
						self.sendcmd("?");
					} else {
						self.log('error',self.config.label +" connections limit has been reached! Max 5 controllers possible, but it is " + connectedDevices + "! Closing connection now.");
						self.socket.destroy(); // TODO: there should be a possibility for the user to reconnect
					}

			}
			if (line.match(/DEV\d+/)) {
				this.model = parseInt(line.match(/DEV(\d+)/)[1]);
				switch (this.model) {
					case 97: this.modelname = 'NeXtage 16'; break;
					case 98: this.modelname = 'SmartMatriX Ultra'; break;
					case 99: this.modelname = 'Ascender 32'; break;
					case 100: this.modelname = 'Ascender 48'; break;
					case 102: this.modelname = 'Output Expander 16'; break;
					case 103: this.modelname = 'Output Expander 32'; break;
					case 104: this.modelname = 'Output Expander 48'; break;
					case 105: this.modelname = 'NeXtage 16 - 4K'; break;
					case 106: this.modelname = 'SmartMatriX Ultra - 4K'; break;
					case 107: this.modelname = 'Ascender 32 - 4K'; break;
					case 108: this.modelname = 'Ascender 48 - 4K'; break;
					case 112: this.modelname = 'Ascender 16'; break;
					case 113: this.modelname = 'Ascender 16 - 4K'; break;
					case 114: this.modelname = 'Ascender 48 - 4K - PL'; break;
					case 115: this.modelname = 'Output Expander 48 - 4K  - PL'; break;
					case 116: this.modelname = 'NeXtage 08'; break;
					case 117: this.modelname = 'NeXtage 08 - 4K'; break;
					case 118: this.modelname = 'Ascender 32 - 4K -PL'; break;
					case 119: this.modelname = 'Output Expander 32 - 4K - PL'; break;
					default: this.modelname = 'unknown'; break;
				}
				self.log('info', self.config.label +" Type is "+ this.modelname);
				self.sendcmd("0,TPver");
			}

			if (line.match(/TPver\d+/)) {
				var commandSetVersion = parseInt(line.match(/TPver\d+,(\d+)/)[1]);
				self.log('info', "Command set version of " + self.config.label +" is " + commandSetVersion);
				// TODO: Should check the machine state now, will be implemented after feedback system is done
			}

			if (line.match(/TPdie0/)) {
				//There is no parameter readback runnning, it can be started now
			}


			if (line.match(/E\d{2}/)) {
				switch (parseInt(line.match(/E(\d{2})/)[1])) {
					case 10: self.log('error',"Received command name error from "+ self.config.label +": "+ line); break;
					case 11: self.log('error',"Received index value out of range error from "+ self.config.label +": "+ line); break;
					case 12: self.log('error',"Received index count (too few or too much) error from "+ self.config.label +": "+ line); break;
					case 13: self.log('error',"Received value out of range error from "+ self.config.label +": "+ line); break;
					default: self.log('error',"Received unspecified error from Livecore "+ self.config.label +": "+ line);
				}
			}

		});

	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'IP-Adress of Livecore Unit',
			width: 6,
			default: '192.168.2.140',
			regex: self.REGEX_IP,
			tooltip: 'Enter the IP-adress of the Livecore unit you want to control. The IP of the unit can be found on the frontpanel LCD.\nIf you want to control stacked configurations, please enter the IP of the master unit.'
		},{
			type: 'dropdown',
			label: 'Variant',
			id: 'variant',
			default: '1',
			choices: [
				{ id: '1', label: 'ASC4806' },
				{ id: '2', label: 'ASC3204' },
				{ id: '3', label: 'ASC1602' },
				{ id: '4', label: 'NXT1604' },
				{ id: '5', label: 'NXT0802' },
				{ id: '6', label: 'SMX12x4' }
			]
		},{
			type: 'dropdown',
			label: 'Port number',
			id: 'port',
			default: '10600',
			choices: [
				{ id: '10600', label: '10600 (default)' },
				{ id: '10500', label: '10500' }
			]
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
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
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd = '';

	switch(action.action) {

	case 'takescreen':
		cmd = '' + action.options.screen + ',1SPCtk';
		break;

	case 'setfilter':
		var filterval = 0;
		if (action.options.filter1 == '1') filterval += 1;
		if (action.options.filter2 == '1') filterval += 2;
		if (action.options.filter4 == '1') filterval += 4;
		if (action.options.filter8 == '1') filterval += 8;
		if (action.options.filter16 == '1') filterval += 16;
		if (action.options.filter32 == '1') filterval += 32;
		if (action.options.filter64 == '1') filterval += 64;
		if (action.options.filter128 == '1') filterval += 128;
		if (action.options.filter256 == '1') filterval += 256;
		if (action.options.filter512 == '1') filterval += 512;
		if (action.options.filter1024 == '1') filterval += 1024;
		if (action.options.filter2048 == '1') filterval += 2048;
		cmd = filterval + 'PMcat';
		break;

	case 'loadpreset':
		// set scale
		if (action.options.scale == '0') {
			cmd = '0PMlse\n';
		} else {
			cmd = '1PMlse\n';
		}

		// set memory to load
		cmd += '' + (parseInt(action.options.memory)-1) + 'PMmet\n';

		// set destination screen
		cmd += '' + (parseInt(action.options.destscreen)-1) + 'PMscf\n';

		// set preview/program
		if (action.options.pgmpvw == '0') {
			cmd += '0PMprf\n';
		} else {
			cmd += '1PMprf\n';
		}

		// do the load
		cmd += '1PMloa'; //last line break is added in sendcmd

		break;

	case 'loadconfidence':
		// set memory to load
		cmd = '' + (parseInt(action.options.memory)-1) + ',';
		// set destination screen
		cmd += '' + (parseInt(action.options.destscreen)-1) + ',1CMloa';
		break;

	case 'activateconfidence':
		// select screen
		cmd = '' + (parseInt(action.options.screen)-1) + ',';
		// set destination screen
		cmd += action.options.mode + 'SCico';
		break;

	case 'loadmaster':
		// set scale
		if (action.options.scale == '0') {
			cmd += '0PMlse\n';
		} else {
			cmd += '1PMlse\n';
		}

		// set memory to load
		cmd += (parseInt(action.options.memory)-1) + 'PSmet\n';

		// set preview/program
		if (action.options.pgmpvw == '0') {
			cmd += '0PSprf\n';
		} else {
			cmd += '1PSprf\n';
		}

		// do the load
		cmd += '1PSloa'; //last line break is added in sendcmd

		break;

	case 'loadmonitoring':

		// set memory to load
		cmd = '' + (parseInt(action.options.memory)-1) + ',';

		// set device
		if (action.options.device == '1') {
			cmd += '1,';
		} else {
			cmd += '0,';
		}

		// do the load
		cmd += '1MMloa'; //last line break is added in sendcmd

		break;

	case 'monitoringfullscreen':
		if (action.options.fullscreen == 1) {
			// select input
			cmd = '' + action.options.device + ',' + (parseInt(action.options.input)-1) + 'MLfes\n';
			// activate fullscreen
			cmd += '' + action.options.device + ',1MLfen\n';
		} else {
			// deactivate fullscreen
			cmd = '' + action.options.device + ',0MLfen\n';
		}
		cmd += '' + action.options.device + ',0MLupd\n' + action.options.device + ',1MLupd';
		break;

	case 'inputfreeze':
		// set input
		cmd = '' + (parseInt(action.options.input)-1) + ',';
		// freeze?
		cmd += action.options.freeze + 'INfrz';
		break;

	case 'switchplug':
		// set input
		cmd = '' + (parseInt(action.options.input)-1) + ',';
		// set plug
		cmd += action.options.plug + 'INplg';
		break;

	case 'sendcustomcommand':
		cmd = action.options.command;
		break;

	case 'selectscreens':
		cmd = '';
		for (var option in action.options) {
			if (action.options[option] == '1') {
				cmd += option +',1SPscl\n';
			} else if (action.options[option] == '2') {
				cmd += option +',0SPscl\n';
			}
		}

		if (cmd == '') {
			return;
		} else {
			cmd = cmd.trim();
		}
		break;

	default:
		cmd = '';
		if (action.options) {
			for (var i = 0; i<= 5; i++) {
				if (action.options.hasOwnProperty(i) && action.options[i] != '') {
					cmd += action.options[i] + ',';
				}
			}
			if (action.options.hasOwnProperty('value') && action.options['value'] != '') {
				cmd += action.options['value'];
			}
		}
		cmd += action.action;
		break;
	}
	self.sendcmd(cmd);
};


instance.prototype.sendcmd = function(cmd) {
	var self = this;
	cmd +="\n";

	if (cmd !== undefined) {

		if (self.socket === undefined) {
			self.init_tcp();
		}

		// TODO: remove this when issue #71 is fixed
		if (self.socket !== undefined && self.socket.host != self.config.host) {
			self.init_tcp();
		}

		debug('sending tcp',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
		} else {
			debug('Socket not connected :(');
		}

	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
