const Plugin = require('../Plugin')
const katex = require('katex').default
const domtoimage = require('dom-to-image')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const Discord = require('discord.js')
const fs = require('pn/fs')
const svg2png = require("svg2png");

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
    // var Canvas = require('canvas')
    // var Image = Canvas.Imag
    // var canvas = new Canvas(200, 200)
    // var ctx = canvas.getContext('2d')
    // var fs = require('fs')
    // var out = fs.createWriteStream(__dirname + '/text.png')
    // var stream = canvas.pngStream();
    // console.log('rendering')
    // let input = params.join('')
    // let katexString = katex.renderToString(input)

    // let dom = new JSDOM('<div id="katex">'+katexString+'</div>')
    // stream.on('data', function(chunk){
    //   out.write(chunk);
    // });

    // stream.on('end', function(){
    //   console.log('saved png');
    // });


    // ctx.font = '30px Impact'
    // ctx.rotate(0.1)
    // ctx.fillText('Awesome!', 50, 100)
    // ctx.fillStyle="#FF0000"
    // ctx.fillRect(20,20,150,100)

    // canvas.pngStream()

    // domtoimage.toBlob(dom.window.document.getElementById('katex')).then(blob=>{
    //   const embed = new Discord.RichEmbed()
    //     .setImage(url)
    //     tzuyu.send({embed})
    // }).catch(e=>{
    //   console.error(e)
    // })
    var mjAPI = require("mathjax-node");
    mjAPI.config({
      MathJax: {
        // traditional MathJax configuration
      }
    });
    mjAPI.start();

    var yourMath = params.join(' ');

    mjAPI.typeset({
      math: yourMath,
      format: "TeX", // "inline-TeX", "MathML"
      svg:true
    }, function (data) {
      if (!data.errors) {
        svg2png(data.svg, {width: parseInt(data.width)*16, height: parseInt(data.height)*16})
          .then(buffer => {
            console.log(data)
            let fname = '/'+Date.now()+'.png'
            fs.writeFile(__dirname+fname, buffer).then(()=> {
              tzuyu.send('', {
                //this is deprecated...
                file: __dirname+fname
              })
            })

            // const attachment = new Discord.Attachment().setAttachment(buffer)
            // var embed = new Discord.RichEmbed()
            // .setTitle('math')

            // console.log(embed)

            // embed.attachFile({
            //   attachment: buffer,
            //   name: 'math.jpg'
            // })

            // fs.writeFile("dest.png", buffer)
          }).catch(e => console.error(e));
      }
    });


  }

}

module.exports = Latex