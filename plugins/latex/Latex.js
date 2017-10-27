const Plugin = require('../Plugin')
const Discord = require('discord.js')
const svg2png = require('svg2png')

class Latex extends Plugin {
  constructor () {
    super()
    this.title = 'Latex Renderer'
    this.desc = 'An attempt at rendering LaTeX stuff'
    this.help = 'Go look up how to do LaTeX things on the Googles'
  }
  register () {
    return {
      trigger: ['render'],
      action: [this.render],
      injects: ['Tzuyu@tzuyu'],
      help: {
        render: 'Call this to render your shit'
      }
    }
  }

  render (tzuyu, ...params) {
    var mjAPI = require('mathjax-node')
    mjAPI.config({
      MathJax: {
        // traditional MathJax configuration
      }
    })
    mjAPI.start()

    var yourMath = params.join(' ')

    mjAPI.typeset({
      math: yourMath,
      format: 'TeX', // "inline-TeX", "MathML"
      svg: true
    }, function (data) {
      if (!data.errors) {
        svg2png(data.svg, {width: parseInt(data.width) * 16, height: parseInt(data.height) * 16})
          .then(buffer => {
            console.log(data)
            let attachment = new Discord.Attachment(buffer)
            tzuyu.send('', attachment)
          }).catch(e => {tzuyu.message(e)})
      }
    })
  }
}

module.exports = Latex
