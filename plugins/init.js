const fs = require('fs')

function registerPlugins (delegator, events) {
  let dir = fs.readdirSync('./plugins')
  for (let i = 0; i < dir.length; i++) {
    // ignore folders
    if (dir[i].search(/\..*$/) !== -1) {
      continue
    }

    // find the PascalCase'd name of the file in a folder that we're looking at
    let Plugin = require('./' + dir[i] + '/' + (string => { return string.charAt(0).toUpperCase() + string.slice(1) })(dir[i]))
    let pluginInstance = new Plugin(events)
    console.log('Loading: ' + dir[i])
    let register = pluginInstance.register()
    let help = register.help || pluginInstance.help

    // delegate it boys
    delegator.registerPluginHook(register.trigger, register.action, register.injects, help, register.enabled, pluginInstance, register.priority)
  }
}

module.exports = registerPlugins
