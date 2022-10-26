const tcp = require('../../tcp')
const instance_skel = require('../../instance_skel')
const actions = require('./actions')
const feedback = require('./feedback')
const presets = require('./presets')

const awconfig = require('./awconfig.json')

let debug
let log

class instance extends instance_skel {
	/**
	 * Create an instance.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 *
	 */
	constructor(system, id, config) {
		super(system, id, config)

		Object.assign(this, {
			...actions,
			...feedback,
			...presets,
		})

		this.firmwareVersion = '0'
		this.outputs = []
		this.screens = []
		this.inputs = []
		this.modelnum
		this.modelname = ''
		this.tallyPGM = []
		this.tallyPRV = []
		this.activeScreen = []

		this.actions() // export actions
	}
	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 *
	 */
	actions(system) {
		this.setActions(this.getActions())
	}
	/**
	 * initialize feedbacks.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 *
	 */
	feedbacks(system) {
		var feedbacks = this.getFeedbacks()

		this.setFeedbackDefinitions(feedbacks)
	}
	/**
	 * Initialize presets
	 * 
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 */
	presets(system) {
		this.setPresetDefinitions(this.getPresets())
	}
	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 *
	 */
	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'IP-Adress of Livecore Unit',
				width: 6,
				default: '192.168.2.140',
				regex: this.REGEX_IP,
				tooltip:
					'Enter the IP-adress of the Livecore unit you want to control. The IP of the unit can be found on the frontpanel LCD.\nIf you want to control stacked configurations, please enter the IP of the master unit.',
			},
			{
				type: 'dropdown',
				label: 'Model',
				id: 'model',
				default: 'Ascender48',
				choices: [
					{ id: 'Ascender48', label: 'Ascender 48' },
					{ id: 'Ascender32', label: 'Ascender 32' },
					{ id: 'Ascender16', label: 'Ascender 16' },
					{ id: 'Nextage16', label: 'Nextage 16' },
					{ id: 'Nextage08', label: 'Nextage 08' },
				],
			},
			{
				type: 'dropdown',
				label: 'Port number',
				id: 'port',
				default: '10600',
				choices: [
					{ id: '10600', label: '10600 (default)' },
					{ id: '10500', label: '10500' },
				],
			},
		]
	}
	// When module gets deleted
	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		debug('destroy', this.id)
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.1.0
	 */
	updateConfig(config) {
		let resetConnection = false

		if (this.config.host != config.host || this.config.port != config.port) {
			resetConnection = true
		}

		this.config = config
		if (resetConnection === true || this.socket === undefined) {
			this.init_tcp()
		}
		this.feedbacks()
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 *
	 */
	init() {
		debug = this.debug
		log = this.log

		this.init_tcp()
		this.feedbacks()
		this.presets()
	}
	/**
	 * TCP initialization
	 *
	 * @access protected
	 *
	 */
	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.status(status, message)
			})

			this.socket.on('error', (err) => {
				this.debug('Network error', err)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('connect', () => {
				this.debug('Connected')
				this.sendcmd('')
				this.socket.receivebuffer = ''
			})

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0,
					line = '',
					offset = 0
				this.socket.receivebuffer += chunk
				while ((i = this.socket.receivebuffer.indexOf('\r\n', offset)) !== -1) {
					line = this.socket.receivebuffer.substr(offset, i - offset)
					offset = i + 1
					this.socket.emit('receiveline', line.toString())
				}
				this.socket.receivebuffer = this.socket.receivebuffer.substr(offset)
			})

			this.socket.on('receiveline', (line) => {
				if (line.match(/TPcon\d,\d+/)) {
					if (line.match(/TPcon0,\d+/) == null) {
						this.log(
							'error',
							'Connected to ' +
								this.config.label +
								', but this is not the master of stacked configuation! Closing connection now.'
						)
						this.socket.destroy()
					}
					var connectedDevices = parseInt(line.match(/TPcon0,(\d)/)[1])
					if (connectedDevices < 4) {
						this.log('info', this.config.label + ' has ' + (connectedDevices - 1) + ' other connected controller(s).')
						this.sendcmd('?')
					} else if (connectedDevices == 4) {
						this.log('warn', this.config.label + ' has 4 other connected controllers. Maximum reached.')
						this.sendcmd('?')
					} else {
						this.log(
							'error',
							this.config.label +
								' connections limit has been reached! Max 5 controllers possible, but it is ' +
								connectedDevices +
								'! Closing connection now.'
						)
						this.socket.destroy() // TODO: there should be a possibility for the user to reconnect
					}
				}
				if (line.match(/DEV\d+/)) {
					this.model = parseInt(line.match(/DEV(\d+)/)[1])
					switch (this.model) {
						case 97:
							this.modelname = 'NeXtage 16'
							break
						case 98:
							this.modelname = 'SmartMatriX Ultra'
							break
						case 99:
							this.modelname = 'Ascender 32'
							break
						case 100:
							this.modelname = 'Ascender 48'
							break
						case 102:
							this.modelname = 'Output Expander 16'
							break
						case 103:
							this.modelname = 'Output Expander 32'
							break
						case 104:
							this.modelname = 'Output Expander 48'
							break
						case 105:
							this.modelname = 'NeXtage 16 - 4K'
							break
						case 106:
							this.modelname = 'SmartMatriX Ultra - 4K'
							break
						case 107:
							this.modelname = 'Ascender 32 - 4K'
							break
						case 108:
							this.modelname = 'Ascender 48 - 4K'
							break
						case 112:
							this.modelname = 'Ascender 16'
							break
						case 113:
							this.modelname = 'Ascender 16 - 4K'
							break
						case 114:
							this.modelname = 'Ascender 48 - 4K - PL'
							break
						case 115:
							this.modelname = 'Output Expander 48 - 4K  - PL'
							break
						case 116:
							this.modelname = 'NeXtage 08'
							break
						case 117:
							this.modelname = 'NeXtage 08 - 4K'
							break
						case 118:
							this.modelname = 'Ascender 32 - 4K -PL'
							break
						case 119:
							this.modelname = 'Output Expander 32 - 4K - PL'
							break
						default:
							this.modelname = 'unknown'
							break
					}
					this.log('info', this.config.label + ' Type is ' + this.modelname)
					this.sendcmd('0,TPver')
				}

				if (line.match(/TPver\d+/)) {
					var commandSetVersion = parseInt(line.match(/TPver\d+,(\d+)/)[1])
					this.log('info', 'Command set version of ' + this.config.label + ' is ' + commandSetVersion)
					// TODO: Should check the machine state now, will be implemented after feedback system is done
				}

				if (line.match(/TPdie0/)) {
					//There is no parameter readback runnning, it can be started now
				}

				if (line.match(/E\d{2}/)) {
					switch (parseInt(line.match(/E(\d{2})/)[1])) {
						case 10:
							this.log('error', 'Received command name error from ' + this.config.label + ': ' + line)
							break
						case 11:
							this.log('error', 'Received index value out of range error from ' + this.config.label + ': ' + line)
							break
						case 12:
							this.log(
								'error',
								'Received index count (too few or too much) error from ' + this.config.label + ': ' + line
							)
							break
						case 13:
							this.log('error', 'Received value out of range error from ' + this.config.label + ': ' + line)
							break
						default:
							this.log('error', 'Received unspecified error from Livecore ' + this.config.label + ': ' + line)
					}
				}

				if (line.match(/TAopr\d+,(0|1)$/)) {
					//Program Tally Information
					const input = line.replace('TAopr', '').split(',')
					this.tallyPGM[Number(input[0])] = Number(input[1])
					//debug('program inputs: ' + tallyPGM)
					this.checkFeedbacks('input_active')
				}
				if (line.match(/TAopw\d+,(0|1)$/)) {
					//Preview Tally information
					const input = line.replace('TAopw', '').split(',')
					this.tallyPRV[Number(input[0])] = Number(input[1])
					//debug('preview inputs: ' + tallyPRV)
					this.checkFeedbacks('input_previewed')
				}
				if (line.match(/SPscl\d+,(0|1)$/)) {
					//Information about selected screens for global take
					const screen = line.replace('SPscl', '').split(',')
					this.activeScreen[Number(screen[0])] = Number(screen[1])
					//debug('screens active: ' + this.activeScreen)
					this.checkFeedbacks('screen_active')
				}

				debug('Received line from Livecore:', line)
			})
			this.socket.on('end', () => {
				debug('Disconnected, ok')
				this.socket.destroy()
				delete this.socket
			})
		}
	}

	feedback(feedback) {
		if (feedback.type === 'input_active') {
			if (this.tallyPGM[feedback.options.source]) {
				return true
			}

			return false
		}
		if (feedback.type === 'input_previewed') {
			if (this.tallyPRV[feedback.options.source]) {
				return true
			}
			return false
		}
		if (feedback.type === 'screen_active') {
			if (this.activeScreen[feedback.options.screen]) {
				return true
			}
			return false
		}
		return false
	}
	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 *
	 */
	action(action) {
		var cmd = ''

		switch (action.action) {
			case 'globaltake':
				cmd = '1SPtsl'
				break
			case 'takescreen':
				cmd = '' + action.options.screen + ',1SPCtk'
				break

			case 'setfilter':
				var filterval = 0
				if (action.options.filter1 == '1') filterval += 1
				if (action.options.filter2 == '1') filterval += 2
				if (action.options.filter4 == '1') filterval += 4
				if (action.options.filter8 == '1') filterval += 8
				if (action.options.filter16 == '1') filterval += 16
				if (action.options.filter32 == '1') filterval += 32
				if (action.options.filter64 == '1') filterval += 64
				if (action.options.filter128 == '1') filterval += 128
				if (action.options.filter256 == '1') filterval += 256
				if (action.options.filter512 == '1') filterval += 512
				if (action.options.filter1024 == '1') filterval += 1024
				if (action.options.filter2048 == '1') filterval += 2048
				cmd = filterval + 'PMcat'
				break

			case 'loadpreset':
				// set scale
				if (action.options.scale == '0') {
					cmd = '0PMlse\n'
				} else {
					cmd = '1PMlse\n'
				}

				// set memory to load
				cmd += '' + (parseInt(action.options.memory) - 1) + 'PMmet\n'

				// set destination screen
				cmd += '' + (parseInt(action.options.destscreen) - 1) + 'PMscf\n'

				// set preview/program
				if (action.options.pgmpvw == '0') {
					cmd += '0PMprf\n'
				} else {
					cmd += '1PMprf\n'
				}

				// do the load
				cmd += '1PMloa' //last line break is added in sendcmd

				break

			case 'loadconfidence':
				// set memory to load
				cmd = '' + (parseInt(action.options.memory) - 1) + ','
				// set destination screen
				cmd += '' + (parseInt(action.options.destscreen) - 1) + ',1CMloa'
				break

			case 'activateconfidence':
				// select screen
				cmd = '' + (parseInt(action.options.screen) - 1) + ','
				// set destination screen
				cmd += action.options.mode + 'SCico'
				break

			case 'loadmaster':
				// set scale
				if (action.options.scale == '0') {
					cmd += '0PMlse\n'
				} else {
					cmd += '1PMlse\n'
				}

				// set memory to load
				cmd += parseInt(action.options.memory) - 1 + 'PSmet\n'

				// set preview/program
				if (action.options.pgmpvw == '0') {
					cmd += '0PSprf\n'
				} else {
					cmd += '1PSprf\n'
				}

				// do the load
				cmd += '1PSloa' //last line break is added in sendcmd

				break

			case 'loadmonitoring':
				// set memory to load
				cmd = '' + (parseInt(action.options.memory) - 1) + ','

				// set device
				if (action.options.device == '1') {
					cmd += '1,'
				} else {
					cmd += '0,'
				}

				// do the load
				cmd += '1MMloa' //last line break is added in sendcmd

				break

			case 'monitoringfullscreen':
				if (action.options.fullscreen == 1) {
					// select input
					cmd = '' + action.options.device + ',' + (parseInt(action.options.input) - 1) + 'MLfes\n'
					// activate fullscreen
					cmd += '' + action.options.device + ',1MLfen\n'
				} else {
					// deactivate fullscreen
					cmd = '' + action.options.device + ',0MLfen\n'
				}
				cmd += '' + action.options.device + ',0MLupd\n' + action.options.device + ',1MLupd'
				break

			case 'inputfreeze':
				// set input
				cmd = '' + (parseInt(action.options.input) - 1) + ','
				// freeze?
				cmd += action.options.freeze + 'INfrz'
				break

			case 'switchplug':
				// set input
				cmd = '' + (parseInt(action.options.input) - 1) + ','
				// set plug
				cmd += action.options.plug + 'INplg'
				break

			case 'sendcustomcommand':
				cmd = action.options.command
				break

			case 'selectscreens':
				cmd = ''
				for (var option in action.options) {
					if (action.options[option] == '1') {
						cmd += option + ',1SPscl\n'
					} else if (action.options[option] == '2') {
						cmd += option + ',0SPscl\n'
					}
				}

				if (cmd == '') {
					return
				} else {
					cmd = cmd.trim()
				}
				break

			default:
				cmd = ''
				if (action.options) {
					for (var i = 0; i <= 5; i++) {
						if (action.options.hasOwnProperty(i) && action.options[i] != '') {
							cmd += action.options[i] + ','
						}
					}
					if (action.options.hasOwnProperty('value') && action.options['value'] != '') {
						cmd += action.options['value']
					}
				}
				cmd += action.action
				break
		}
		this.sendcmd(cmd)
	}
	sendcmd(cmd) {
		cmd += '\n'

		if (cmd !== undefined) {
			if (this.socket === undefined) {
				this.init_tcp()
			}

			// TODO: remove this when issue #71 is fixed
			if (this.socket !== undefined && this.socket.host != this.config.host) {
				this.init_tcp()
			}

			debug('sending tcp', cmd, 'to', this.config.host)

			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send(cmd)
			} else {
				debug('Socket not connected :(')
			}
		}
	}
}
exports = module.exports = instance
