const Database = require('./Database')
const PermissionError = require('./../../core/ext/PermissionError')
const Command = require('./Command')

const PERM_ADMIN = 3
const PERM_MOD = 2
const PERM_USER = 1

class PermissionManager {
  constructor () {
    this.db = new Database()
  }

  forceAsync (fn) {
    let iterator = fn()

    let loop = result => {
      // so long as we are not done then the second part will not execute (thanks short circuit operators)
      !result.done && result.value.then(
        res => loop(iterator.next(res)),
        err => loop(iterator.throw(err))
        )
    }
    loop(iterator.next())
  }

  initialize (database, message) {
    if (!this.db.hasConnection()) {
      this.db.provideConnection(database)
    }
    return new Promise((resolve, reject) => {
      this.db.initializeTables(message).then(res => {
        resolve(true)
      })
    })
  }
  _ensureDBConnection (database) {
    if (!this.db.hasConnection()) {
      this.db.provideConnection(database)
    }
  }

  // returns a command object built with data from the database
  getCommand (database, trigger, server, role) {
    this._ensureDBConnection(database)
    return new Promise((resolve, reject) => {
      this.db.getCommand(trigger, server, role).then(command => {
        resolve(command)
      })
    })
  }
  getUser (database, id, server) {
    console.log('getting user')
    this._ensureDBConnection(database)
    return new Promise((resolve, reject) => {
      this.db.getUser(id, server).then(user => {
        console.log('resolving...')
        resolve(user)
      })
    })
  }
  _canPerformAction (database, requester, action) {
    this._ensureDBConnection(database)
    return new Promise((resolve, reject) => {
      // see if we have the ability to perform this action
      this.db.query('SELECT users.permission FROM users INNER JOIN commands ON (users.permission>=commands.permission) WHERE users.user_id=$1 AND commands.trigger=$2', [requester, action]).then(res => {
        if (res.rowCount > 0) {
          resolve(true)
        } else {
          throw new PermissionError('Insufficient priveleges to perform this command')
        }
      })
    })
  }

  _updateUser (user) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT 1 FROM users WHERE user_id=$1', user).then(res => {
        if (res.rowCount === 1) {
          this.db.query('UPDATE users SET permission=$1 WHERE user_id=$2', [user.permission, user.id]).then(res => {
            resolve(true)
          })
        } else {
          this.db.query('INSERT INTO users(user_id, permission) VALUES($1, $2)', [user.id, user.perm]).then(res => {
            resolve(true)
          })
        }
      })
    })
  }
}

module.exports = PermissionManager
