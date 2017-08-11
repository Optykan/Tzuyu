class PermissionError extends Error {
  constructor (message) {
    super(message)
    this.message = message
    this.name = 'PermissionError'
  }
}

module.exports = PermissionError
