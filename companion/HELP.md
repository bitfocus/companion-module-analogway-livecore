# Help section for the AnalogWay Livecore module

With this module you can control all graphic switchers from the Livecore series by Analog Way. Most popular models are Ascender and NeXtage. It is also possible to control stacked configurations or configurations with an output expander. In any case please use the IP of the master machine.
If you want to test your configuration, you can also connect to the Livecore simulator. If you use the simulator on the same computer as Companion use the IP the simulator runs on (default is 192.168.56.101), if you run the simulator on a different machine use the IP of that machine and you have to run AWGateway on that machine too.

Requires Companion 5.1 or newer.

**Connection**

The module connects on TCP port 10500, the port the operator panel itself uses - it is the one that reports live status (e.g. the T-bar position) back. The port is not configurable. The connected model is detected automatically and shown in the connection settings. The connection is monitored and re-established automatically if the device stops responding.

**Dropdowns and expressions**

Screens, memories, master memories, confidence and monitoring memories and inputs are listed by number and name, as read from the device, and only if they actually exist or have something saved to them.

Most screen fields also accept several screens at once - type them into the field or use an expression, either concatenated (`S1S2`) or separated (`1, 2`). Feedbacks with several screens are only true if all of them match. Memory fields accept the plain number or the same number with prefix, e.g. `4` or `SM4`.

**Global take**

Before you can use the global take command you have to select the screens which will be affected by it. The selection is stored in the device until it is changed. The feedback "Screen selected for global take" and the variable `GlobalTake.selection` (e.g. `S1S2`) show the current selection.

**Available actions**

- Take selected screens (Global take)
- Take one or more screens
- Load Memory
- Load Master Memory
- Set recall filter
- Freeze Input (frozen, unfrozen or toggle)
- Recall Monitoring Memory
- Fullscreen Monitoring
- Select screens for global take
- Select one or more screens for global take
- Load confidence Memory
- Switch confidence mode
- Switch input plug
- Send custom command (supports variables)

**Available feedbacks**

- Source used
- Memory active
- Screen selected for global take
- Input Freeze
- Input Plug Active
- Recall Filter Active
- Fullscreen Monitoring Active

**Variables**

- `Device.*` - firmware, connected controllers, fan and temperature alarm, ready status
- `GlobalTake.selection` - screens selected for global take
- `S{n}.*` - per screen: name, T-bar position, memory in program/preview, global take selection, confidence mode, width/height
- `Out{n}.*` - per output: name, active, HDCP
- `Input{n}.label`, `Input{n}.activeplug` - per input: name and active plug
- `SM{n}.label`, `MM{n}.label` - names of saved memories and master memories
- `MonitoringSource{n}.label`, `Plug{n}.label` - names of fullscreen monitoring sources and plug types

**Presets**

Ready-made buttons for loading memories and master memories, switching input plugs, freezing inputs, selecting screens, taking, monitoring memories and fullscreen monitoring. They are built from what actually exists on the connected device and update automatically.
