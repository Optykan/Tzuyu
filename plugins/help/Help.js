const Plugin = require('../Plugin')
const Discord = require('discord.js')

class Help extends Plugin {
  constructor () {
    super()
    this.title = 'Help module'
    this.desc = 'A module that provides help text for everything'
    this.help = '...really?'
  }
  register () {
    return {
      trigger: 'help',
      action: this.handle,
      injects: 'Tzuyu@tzuyu'
    }
  }
  handle (tzuyu, param) {
    let embed = new Discord.RichEmbed()
      .setTitle('Help: ' + param)
      .setColor(0x3498db)
      .setDescription('hello here is help')
    tzuyu.message({embed})
  }
}

module.exports = Help
