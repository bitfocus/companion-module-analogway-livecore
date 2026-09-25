const PLUG_NAMES = ['VGA', 'DVI-A', 'DVI', 'SDI', 'HDMI', 'DisplayPort']

// Colors copied from the user's own hand-built reference buttons, for visual consistency.
const WHITE = 16777215
const DARK_BLUE = 153
const NAVY = 102
const BLACK = 0
const PVW_GREEN = 39168
const PGM_RED = 13107200
const TAKE_RED = 16711680
const SELECT_BLUE = 4210943
const FREEZE_ACTIVE = 12632319

/**
 * Builds the module's preset definitions: one base preset per kind of button, multiplied into a
 * template group per combination that currently exists on the device (only occupied memories,
 * available inputs/plugs, active screens - regenerated live as that state changes, see the
 * `presets()` calls alongside `actions()`/`setFeedbackDefinitions()` throughout analogway_livecore.js).
 *
 * @returns {{ structure: import('@companion-module/base').CompanionPresetSection[], presets: import('@companion-module/base').CompanionPresetDefinitions }}
 */
export const getPresets = (self) => {
	const presets = {}
	const structure = []

	// --- Load Master Memory ---------------------------------------------------------------
	presets['load_master_memory'] = {
		type: 'simple',
		name: 'Load Master Memory',
		style: {
			text: 'Load\\nMaster Memory #$(local:mastermemory)\\n$(livecore:MM$(local:mastermemory).label)',
			size: 'auto',
			color: WHITE,
			bgcolor: DARK_BLUE,
		},
		steps: [
			{
				down: [
					{
						actionId: 'loadmaster',
						options: {
							memory: { value: '$(local:mastermemory)', isExpression: true },
							pgmpvw: { value: '1', isExpression: false },
							scale: { value: '1', isExpression: false },
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
		localVariables: [{ variableName: 'mastermemory', variableType: 'simple', startupValue: '1' }],
	}
	const masterMemoryValues = self.masterMemoryValid
		.map((valid, m) => (valid ? { value: String(m + 1), name: `${m + 1}` + (self.masterMemoryNames[m] ? ` - ${self.masterMemoryNames[m]}` : '') } : undefined))
		.filter((v) => v !== undefined)
	if (masterMemoryValues.length > 0) {
		structure.push({
			id: 'load_master_memory_section',
			name: 'Load Master Memory',
			definitions: [
				{
					id: 'load_master_memory_group',
					type: 'template',
					name: 'Load Master Memory',
					presetId: 'load_master_memory',
					templateVariableName: 'mastermemory',
					templateValues: masterMemoryValues,
				},
			],
		})
	}

	// --- Load Memory to Screen (one group per active screen) -------------------------------
	presets['load_memory_to_screen'] = {
		type: 'simple',
		name: 'Load Memory to Screen',
		style: {
			text: 'Load\\nSM$(local:screenmemory)\\n$(livecore:SM$(local:screenmemory).label)\\nto S$(local:screen)',
			size: 'auto',
			color: WHITE,
			bgcolor: DARK_BLUE,
		},
		steps: [
			{
				down: [
					{
						actionId: 'loadpreset',
						options: {
							memory: { value: '$(local:screenmemory)', isExpression: true },
							destscreen: { value: '$(local:screen)', isExpression: true },
							pgmpvw: { value: '1', isExpression: false },
							scale: { value: '1', isExpression: false },
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'memory_active',
				options: {
					memory: { value: '$(local:screenmemory)', isExpression: true },
					screen: { value: '$(local:screen)', isExpression: true },
					preset: { value: 'pvw', isExpression: false },
				},
				style: { color: WHITE, bgcolor: PVW_GREEN },
			},
			{
				feedbackId: 'memory_active',
				options: {
					memory: { value: '$(local:screenmemory)', isExpression: true },
					screen: { value: '$(local:screen)', isExpression: true },
					preset: { value: 'pgm', isExpression: false },
				},
				style: { color: WHITE, bgcolor: PGM_RED },
			},
		],
		localVariables: [
			{ variableName: 'screenmemory', variableType: 'simple', startupValue: '1' },
			{ variableName: 'screen', variableType: 'simple', startupValue: '1' },
		],
	}
	const screenMemoryValues = self.presetMemoryValid
		.map((valid, m) => (valid ? { value: String(m + 1), name: `${m + 1}` + (self.presetMemoryNames[m] ? ` - ${self.presetMemoryNames[m]}` : '') } : undefined))
		.filter((v) => v !== undefined)
	const loadMemoryGroups = []
	if (screenMemoryValues.length > 0) {
		self.screenEnabled.forEach((enabled, s) => {
			if (!enabled) return
			loadMemoryGroups.push({
				id: `load_memory_to_screen_s${s + 1}`,
				type: 'template',
				name: `Load Memory to S${s + 1}` + (self.screenNames[s] ? ` - ${self.screenNames[s]}` : ''),
				presetId: 'load_memory_to_screen',
				templateVariableName: 'screenmemory',
				templateValues: screenMemoryValues,
				commonVariableValues: { screen: String(s + 1) },
			})
		})
	}
	if (loadMemoryGroups.length > 0) {
		structure.push({ id: 'load_memory_to_screen_section', name: 'Load Memory to Screen', definitions: loadMemoryGroups })
	}

	// --- Switch Input Plug (one group per available input) ---------------------------------
	presets['switch_plug'] = {
		type: 'simple',
		name: 'Switch Input Plug',
		style: {
			text: 'Input $(local:input)\\n$(livecore:Input$(local:input).label)\\n$(livecore:Plug$(local:plug).label)',
			size: 'auto',
			color: WHITE,
			bgcolor: BLACK,
		},
		steps: [
			{
				down: [
					{
						actionId: 'switchplug',
						options: {
							input: { value: '$(local:input)', isExpression: true },
							plug: { value: '$(local:plug)', isExpression: true },
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'input_plug_active',
				options: {
					input: { value: '$(local:input)', isExpression: true },
					plug: { value: '$(local:plug)', isExpression: true },
				},
				style: { color: WHITE, bgcolor: PGM_RED },
			},
		],
		localVariables: [
			{ variableName: 'input', variableType: 'simple', startupValue: '1' },
			{ variableName: 'plug', variableType: 'simple', startupValue: '0' },
		],
	}
	const switchPlugGroups = []
	self.inputAvailable.forEach((available, i) => {
		if (!available) return
		const plugValues = self.inputPlugAvailable[i]
			.map((plugAvailable, p) => (plugAvailable ? { value: String(p), name: PLUG_NAMES[p] } : undefined))
			.filter((v) => v !== undefined)
		if (plugValues.length === 0) return
		switchPlugGroups.push({
			id: `switch_plug_input${i + 1}`,
			type: 'template',
			name: `Input ${i + 1}` + (self.inputNames[i] ? ` - ${self.inputNames[i]}` : ''),
			presetId: 'switch_plug',
			templateVariableName: 'plug',
			templateValues: plugValues,
			commonVariableValues: { input: String(i + 1) },
		})
	})
	if (switchPlugGroups.length > 0) {
		structure.push({ id: 'switch_plug_section', name: 'Switch Input Plug', definitions: switchPlugGroups })
	}

	// --- Recall Monitoring Memory (all 8, no per-slot validity flag exists) ----------------
	presets['recall_monitoring_memory'] = {
		type: 'simple',
		name: 'Recall Monitoring Memory',
		style: {
			text: 'Monitoring\\nRecall\\nMemory #$(local:monitoring)',
			size: 'auto',
			color: WHITE,
			bgcolor: BLACK,
		},
		steps: [
			{
				down: [
					{
						actionId: 'loadmonitoring',
						options: {
							memory: { value: '$(local:monitoring)', isExpression: true },
							device: { value: '0', isExpression: false },
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
		localVariables: [{ variableName: 'monitoring', variableType: 'simple', startupValue: '1' }],
	}
	structure.push({
		id: 'recall_monitoring_memory_section',
		name: 'Recall Monitoring Memory',
		definitions: [
			{
				id: 'recall_monitoring_memory_group',
				type: 'template',
				name: 'Recall Monitoring Memory',
				presetId: 'recall_monitoring_memory',
				templateVariableName: 'monitoring',
				templateValues: Array.from({ length: 8 }, (_, m) => ({
					value: String(m + 1),
					name: `${m + 1}` + (self.monitoringMemoryNames[m] ? ` - ${self.monitoringMemoryNames[m]}` : ''),
				})),
			},
		],
	})

	// --- Other single-instance templates (one reusable preset each, not multiplied) --------
	presets['take_screen'] = {
		type: 'simple',
		name: 'Take Screen',
		style: { text: 'TAKE\\nScreen $(local:screen)', size: '24', color: WHITE, bgcolor: DARK_BLUE },
		steps: [{ down: [{ actionId: 'takescreen', options: { screen: { value: '$(local:screen)', isExpression: true } } }], up: [] }],
		feedbacks: [{ feedbackId: 'internal:buttonPushed', options: {}, style: { color: WHITE, bgcolor: TAKE_RED } }],
		localVariables: [{ variableName: 'screen', variableType: 'simple', startupValue: '1' }],
	}
	presets['select_screen'] = {
		type: 'simple',
		name: 'Select Screen for Global Take',
		style: { text: 'Select\\nScreen\\n$(local:screen)', size: 'auto', color: WHITE, bgcolor: NAVY },
		steps: [
			{
				down: [
					{
						actionId: 'selectscreen',
						options: { screen: { value: '$(local:screen)', isExpression: true }, action: { value: '3', isExpression: false } },
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'screen_active',
				options: { screen: { value: '$(local:screen)', isExpression: true } },
				style: { color: WHITE, bgcolor: SELECT_BLUE },
			},
		],
		localVariables: [{ variableName: 'screen', variableType: 'simple', startupValue: '1' }],
	}
	const selectScreenValues = self.screenEnabled
		.map((enabled, s) => (enabled ? { value: String(s + 1), name: `S${s + 1}` + (self.screenNames[s] ? ` - ${self.screenNames[s]}` : '') } : undefined))
		.filter((v) => v !== undefined)
	if (selectScreenValues.length > 0) {
		structure.push({
			id: 'select_screen_section',
			name: 'Select Screen for Global Take',
			definitions: [
				{
					id: 'select_screen_group',
					type: 'template',
					name: 'Select Screen for Global Take',
					presetId: 'select_screen',
					templateVariableName: 'screen',
					templateValues: selectScreenValues,
				},
			],
		})
	}

	presets['global_take'] = {
		type: 'simple',
		name: 'Global Take',
		style: { text: 'Global\\nTAKE\\n($(livecore:GlobalTake.selection))', size: '18', color: WHITE, bgcolor: NAVY },
		steps: [{ down: [{ actionId: '1SPtsl', options: {} }], up: [] }],
		feedbacks: [],
		localVariables: [],
	}
	presets['freeze_input'] = {
		type: 'simple',
		name: 'Freeze Input',
		style: { text: 'Freeze\\nInput #$(local:input)\\n$(livecore:Input$(local:input).label)', size: 'auto', color: WHITE, bgcolor: NAVY },
		steps: [
			{
				down: [{ actionId: 'inputfreeze', options: { input: { value: '$(local:input)', isExpression: true }, freeze: { value: '2', isExpression: false } } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'input_frozen',
				options: { input: { value: '$(local:input)', isExpression: true } },
				style: { color: WHITE, bgcolor: FREEZE_ACTIVE },
			},
		],
		localVariables: [{ variableName: 'input', variableType: 'simple', startupValue: '1' }],
	}
	const freezeInputValues = self.inputAvailable
		.map((available, i) => (available ? { value: String(i + 1), name: `${i + 1}` + (self.inputNames[i] ? ` - ${self.inputNames[i]}` : '') } : undefined))
		.filter((v) => v !== undefined)
	if (freezeInputValues.length > 0) {
		structure.push({
			id: 'freeze_input_section',
			name: 'Freeze Input',
			definitions: [
				{
					id: 'freeze_input_group',
					type: 'template',
					name: 'Freeze Input',
					presetId: 'freeze_input',
					templateVariableName: 'input',
					templateValues: freezeInputValues,
				},
			],
		})
	}

	presets['fullscreen_monitoring_source'] = {
		type: 'simple',
		name: 'Fullscreen Monitoring - show source',
		style: {
			text: 'Full Screen Monitoring\\n$(livecore:MonitoringSource$(local:fullscreenmonitoring).label)',
			size: 'auto',
			color: WHITE,
			bgcolor: BLACK,
		},
		steps: [
			{
				down: [
					{
						actionId: 'monitoringfullscreen',
						options: {
							input: { value: '$(local:fullscreenmonitoring)', isExpression: true },
							device: { value: '0', isExpression: false },
							fullscreen: { value: '1', isExpression: false },
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'monitoring_fullscreen_active',
				options: { device: { value: '0', isExpression: false }, source: { value: '$(local:fullscreenmonitoring)', isExpression: true } },
				style: { color: WHITE, bgcolor: PGM_RED },
			},
		],
		localVariables: [{ variableName: 'fullscreenmonitoring', variableType: 'simple', startupValue: '1' }],
	}
	// Every source the protocol supports: available inputs, frames/logos of master/slave, and
	// program/preview of every existing screen - see getMonitoringSourceChoices() for the exact rules.
	const monitoringSourceValues = self.getMonitoringSourceChoices().map((choice) => ({ value: choice.id, name: choice.label }))
	if (monitoringSourceValues.length > 0) {
		structure.push({
			id: 'fullscreen_monitoring_source_section',
			name: 'Fullscreen Monitoring - show source',
			definitions: [
				{
					id: 'fullscreen_monitoring_source_group',
					type: 'template',
					name: 'Fullscreen Monitoring - show source',
					presetId: 'fullscreen_monitoring_source',
					templateVariableName: 'fullscreenmonitoring',
					templateValues: monitoringSourceValues,
				},
			],
		})
	}

	presets['monitoring_mosaic_mode'] = {
		type: 'simple',
		name: 'Monitoring - select Mosaic Mode',
		style: { text: 'Monitoring\\nselect\\nMosaic Mode', size: 'auto', color: WHITE, bgcolor: BLACK },
		steps: [
			{
				down: [
					{
						actionId: 'monitoringfullscreen',
						// "input" is ignored when switching back to mosaic mode - a plain literal rather than
						// an empty expression, which Companion would have to fail to evaluate first.
						options: { input: { value: '1', isExpression: false }, device: { value: '0', isExpression: false }, fullscreen: { value: '0', isExpression: false } },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
		localVariables: [],
	}
	structure.push({
		id: 'other_section',
		name: 'Screens and monitoring',
		definitions: ['take_screen', 'global_take', 'monitoring_mosaic_mode'],
	})

	return { structure, presets }
}
