const fs = require('fs')

function registerPlugins (delegator) {
  let dir = fs.readdirSync('./plugins')
  for (let i = 0; i < dir.length; i++) {
    if (dir[i].search('.js') !== -1) {
      break
    }
    let Plugin = require('./' + dir[i] + '/' + (string => { return string.charAt(0).toUpperCase() + string.slice(1) })(dir[i]))
    let pluginInstance = new Plugin()
    let register = pluginInstance.register()
    delegator.registerPluginHook(register.trigger, register.action, register.injects)
  }
  return delegator
}

module.exports = registerPlugins
