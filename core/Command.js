class Command {
  constructor (trigger, callback, injects) {
    // remember injects: thingToInject@paramName,more@things
    this.trigger = trigger
    this.callback = callback
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
    let params = /(?:.*?)\(([\S\s]+)\)\s(?:.*)|(\S+)\s=>\s{$/m.exec(signature)
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
    let accepts = this._getArgSpecs(this.callback) // ['tzuyu']
    let send = []

    console.log('Injects: ')
    console.log(this.injects)
    console.log('Injectables: ')
    console.log(injectables)
    console.log('Accepts: ')
    console.log(accepts)

    // iterate through our bound parameters, see if we can find the thing that we're injecting
    for (let i = 0; i < this.injects.length; i++) {
      // iterate through what our callback accepts, see if we can find where we're injecting it to
      for (let j = 0; j < accepts.length; j++) {
        // if the accept parameter is named the same as the inject target
        console.log(this.injects[i].target + '=' + accepts[j])

        if (this.injects[i].target === accepts[j]) {
          if (!injectables[this.injects[i].inject]) {
            throw new Error('Injectable ' + this.injects[i].inject + 'not found')
          }
          send.push(injectables[this.injects[i].inject])
        }
      }
    }

    console.log(send)

    if (send.length !== accepts.length) {
      throw new Error('Parameters to send must equal the number of bound parameters')
    }

    this.callback(...send, ...params)
  }
}

module.exports = Command
