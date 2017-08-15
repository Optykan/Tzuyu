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
      }).catch(e=>{
        console.error(e)
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
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  getUser (database, id, server) {
    console.log('SERVER (get): '+server)
    this._ensureDBConnection(database)
    return new Promise((resolve, reject) => {
      this.db.getUser(id, server).then(user => {
        resolve(user)
      }).catch(e=>{
        console.error(e)
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

  save (obj) {
    return this.db.save(obj)
  }
}

module.exports = PermissionManager
