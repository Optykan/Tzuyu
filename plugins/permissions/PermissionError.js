const FatalError = require('./../../core/ext/FatalError')

class PermissionError extends FatalError{
  constructor(message){
    super('PermissionError', message)
  }
}

module.exports = PermissionError