class FatalError extends Error {
	constructor (message) {
		super(message)
		this.message = message
		this.name = 'FatalError'
	}
}

module.exports = FatalError
