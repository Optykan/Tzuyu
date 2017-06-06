const fs = require('fs')

function registerPlugins (delegator) {
  let dir = fs.readdirSync('./plugins')
  for (let i = 0; i < dir.length; i++) {
    if (dir[i].search(/\..*$/) !== -1) {
      continue
    }
    let Plugin = require('./' + dir[i] + '/' + (string => { return string.charAt(0).toUpperCase() + string.slice(1) })(dir[i]))
    let pluginInstance = new Plugin()
    console.log('Loading: ' + dir[i])
    let register = pluginInstance.register()
    let help = register.help || pluginInstance.help
    delegator.registerPluginHook(register.trigger, register.action, register.injects, help, register.enabled, pluginInstance, register.priority)
  }
}

module.exports = registerPlugins
