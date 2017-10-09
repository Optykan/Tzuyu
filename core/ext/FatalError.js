class FatalError extends Error {
  constructor (message, name) {
    super(message)
    this.message = message
    this.name = name || 'FatalError'
  }
}

module.exports = FatalError
