class Command {
  constructor (trigger, callback, injects, help, context) {
    // remember injects: thingToInject@paramName,more@things
    this.trigger = trigger
    this.callback = callback
    this.help = help
    this.context = context
    this.injects = injects.split(',').map(element => {
      let s = element.split('@')
      return {
        inject: s[0],
        target: s[1]
      }
    })
  }

  _getArgSpecs (fncDef) {
    // theres no way this can go wrong
    let signature = fncDef.toString().split('\n')[0]
    let params = /(?:.*?)\(([\S\s]+)\)\s(?:.*)|(\S+)\s=>\s{\s?}?$/m.exec(signature)
    if (params[1]) {
      return params[1].split(',').map(elem => {
        return elem.trim()
      })
    } else {
      // only 1 parameter
      return [params[2].trim()]
    }
  }

  execute (injectables, params) {
    // accepts is an array of parameters of what the callback accepts
    // injectables is the stuff we CAN inject
    // this.injects is mapping thingToInject@accepts
    let accepts = this._getArgSpecs(this.callback) // ['tzuyu', 'param1']
    let send = []

    if (this.injects.length !== 0) {
      // iterate through our bound parameters, see if we can find the thing that we're injecting
      for (let i = 0; i < accepts.length; i++) {
        // iterate through what our callback accepts, see if we can find where we're injecting it to
        for (let j = 0; j < this.injects.length; j++) {
          // if the accept parameter is named the same as the inject target

          if (this.injects[j].target === accepts[i]) {
            if (!injectables[this.injects[j].inject]) {
              throw new TypeError('Injectable ' + this.injects[j].inject + 'not found')
            }
            send.push(injectables[this.injects[j].inject])
          }
        }
      }
    }

    if (send.length !== this.injects.length) {
      throw new RangeError('Could not inject specified parameters, found: ' +
        (function (found) {
          var res = ''
          for (let i in found) {
            res += (typeof found[i]) + ','
          }
          return res
        })(send) + ' but specified ' +
        (function (specified) {
          var res = ''
          for (let i in this.injects) {
            res += this.injects[i].inject + ','
          }
          return res
        })(this.injects)
        )
    }

    this.callback.call(this.context, ...send, ...params)
  }
}

module.exports = Command
