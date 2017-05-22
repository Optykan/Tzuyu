const Plugin = require('../Plugin')
const Discord = require('discord.js')

class Help extends Plugin {
  constructor () {
    super()
    this.title = 'Help module'
    this.desc = 'A module that provides help text for everything'
    this.help = '...really?'
    this.enabled = true
  }
  register () {
    return {
      trigger: 'help',
      action: this.handle,
      injects: 'Tzuyu@tzuyu,CommandDelegator@delegator'
    }
  }
  rainbow (start, embed, message) {
    // const colors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x1abc9c, 0x3498db, 0x9b59b6]
    // console.log(start)
    // console.log('edit: ' + colors[start % colors.length])
    // embed.setColor(colors[start % colors.length])
    // message.edit({embed}).then(m => {
    //   setTimeout(() => {
    //     this.rainbow(start + 1, embed, m)
    //   }, 1000)
    // })
  }
  handle (tzuyu, delegator, trigger) {
    // const colors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x1abc9c, 0x3498db, 0x9b59b6]
    // var start = ((max, min) => { return Math.floor(Math.random() * (max - min)) + min })(0, colors.length)
    var embed = ''
    if (trigger) {
      if (trigger === 'me') {
        embed = new Discord.RichEmbed()
        .setTitle('Help: ' + trigger)
        .setColor(0xe74c3c)
        .setDescription('Only the Lord may offer salvation.')
        .setFooter('Matthew 19:25-26')
      } else {
        let command = delegator.findCommand(trigger)
        if (command) {
          embed = new Discord.RichEmbed()
            .setTitle('Help: ' + trigger)
            .setColor(0x3498db)
            .setDescription(command.help)
        } else {
          tzuyu.message('Command ' + command + ' not found')
        }
      }
    } else {
      var description = ''
      for (let i = 0; i < delegator.commands.length; i++) {
        description += '-' + delegator.commands[i].trigger + '\n'
      }
      embed = new Discord.RichEmbed()
        .setTitle('Help: All Commands')
        .setColor(0x3498db)
        .setDescription(description)
    }
    // console.log(tzuyu.client.user)
    embed.setThumbnail(tzuyu.client.user.avatarUrl)
    tzuyu.message({embed}, {messageDelay: -1}, message => {
      // this.rainbow(start, embed, message)
    })
  }
}

module.exports = Help
