# PLUGINS ARE HERE

### Quickstart

Place your plugin in a folder (named with camelCase format) and have a file with PascalCase in the directory

For example, if your plugin name is `SamplePlugin`, there would be a folder named `samplePlugin`, and within it would be a file called `SamplePlugin.js`

Ensure that your plugin `module.exports = <ClassNameHere>` and extends `Plugin` in this directory

### Registering Plugins

In the `register()` method, return an object with the following key-value pairs:

- `trigger`: a string or an array of triggers for your plugin. For example, when someone types `!roll`, the trigger would be `roll`

- `action`: a function or an array of functions (if array, then this function will be executed with the corresponding trigger) of what to do when it is triggered

- `injects`: a string following the format `Injectable@paramName,Injectable2@paramName` or an array of such strings. See "Injectables" for details

- `help` (optional): a string or an array of strings representing the help text for each trigger

- `priority` (optional): an integer or an array of integers representing the load priority of the plugin trigger. A higher priority value will cause the mapped action to run before other commands. The default value is 10. 

In the `constructor()` method, first call `super()` then:

- (optional) set `this.title` to the title of your plugin

- (optional) set `this.desc` to a short description of your plugin

- (optional) set `this.help` to a generic help text for your entire plugin

- (optional) set `this.enabled` to `true`/`false` to enable/disable your plugin. This is `true` by default.

### Injectables

- `Tzuyu`: the bot instance

- `YouTube`: the YouTube interface

- `MediaResolver`: the MediaResolver instance to resolve MediaResolvable objects into playable songs

- `CommandDelegator`: the CommandDelegator instance containing all the registered plugins and associated commands. Use this with care.

### Handling Triggers

Say you have a function with signature `foo(tzuyu, youtube, param1, ...otherParams)`. In your register method, you set it to be triggered by `foo`, the `action` to be `foo` and injected `Tzuyu@tzuyu,YouTube@youtube` into the parameters. When someone types `<CommandPrefix>foo` into chat, the CommandDelegator will run the `foo` method, inject the `Tzuyu` instance into the `tzuyu` parameter, and the `YouTube` instance into the `youtube` parameter.

`param1` will hold the first word after the trigger. For example, with `<CommandPrefix>foo 1 2 3 4`, `param1` would hold `'1'`. `...otherParams` would hold whatever's left in an array, e.g. `['2','3','4']`.

### Event support

You can make things react to events if you want to. Instead of responding to commands, they respond to events emitted by various classes. The syntax is: `event@<Injectable>:<event>` where `Injectable` is one of the supported injectables, and `<event>` is one of the events that the injectable emits. You can find a list of these below:

Just kidding nothing is supported yet.

