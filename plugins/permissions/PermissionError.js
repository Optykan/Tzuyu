const FatalError = require('./../../core/ext/FatalError')

class PermissionError extends FatalError {
  constructor (message) {
    super(message, 'PermissionError')
  }
}

module.exports = PermissionError
