const Command = require('./Command')
const User = require('./User')

const PERM_ADMIN = 3
const PERM_MOD = 2
const PERM_USER = 1

class Database {
  provideConnection (connection) {
    this.connection = connection
  }
  hasConnection () {
    return !!this.connection
  }
  query (query, params) {
    return new Promise((resolve, reject) => {
      if (params) {
        this.connection.query(query, params, (err, res) => {
          if (err) { 
            console.error(err)
            throw err
           }
            resolve(res)
        })
      } else {
        this.connection.query(query, (err, res) => {
          if (err) { 
            console.error(err)
            throw err
          }
            resolve(res)
        })
      }
    })
  }
  getAllTables () {
    var result = {
      users: {},
      commands: {}
    }
    return new Promise((resolve, reject) => {
      this.query('SELECT * FROM users').then(res => {
        result.users = res.rows
        this.query('SELECT * FROM commands').then(res => {
          result.commands = res.rows
          resolve(result)
        }).catch(e=>{
          console.error(e)
        })
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  _createNewUser (id, permission, server) {
    let user = (new User()).fromParams(id, permission, server)

    return new Promise((resolve, reject) => {
      this.save(user).then(res => {
        resolve(user)
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  _createNewCommand (trigger, permission, roleId, server) {
    let command = (new Command()).fromParams(trigger, permission, roleId, server)

    return new Promise((resolve, reject) => {
      this.save(command).then(res => {
        resolve(command)
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  _ensureUserExists (dbResult, id, server) {
    return new Promise((resolve, reject) => {
      if (dbResult.rowCount === 0) {
        return this._createNewUser(id, PERM_USER, server).then(user => {
          resolve(user)
        }).catch(e=>{
        console.error(e)
      })
      } else {
        resolve((new User()).fromDatabase(dbResult.rows[0]))
      }
    })
  }
  _ensureCommandExists (dbResult, trigger, permission, roleId, server) {
    return new Promise((resolve, reject) => {
      if (dbResult.rowCount === 0) {
        return this._createNewCommand(trigger, permission, roleId, server).then(command => {
          resolve(command)
        }).catch(e=>{
          console.error(e)
        })
      } else {
        resolve((new Command()).fromDatabase(dbResult.rows[0]))
      }
    })
  }
  getUser (id, server) {
    // console.log('querying user...')
    let query = 'SELECT * FROM users WHERE user_id=$1'
    let params = [id]

    if (server) {
      query += ' AND server_id=$2'
      params.push(server)
    }

    return new Promise((resolve, reject) => {
      this.query(query, params).then(res => {
        this._ensureUserExists(res, id, server).then(user => {
          resolve(user)
        }).catch(e=>{
          console.error(e)
        })
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  getCommand (trigger, server, role) {
    let index = 2
    let query = 'SELECT * FROM commands WHERE trigger=$1'
    let params = [trigger]
    if (role) {
      query += ' AND role_id=$'+index
      params.push(role)
      index++
    }
    if (server) {
      query += ' AND server_id=$'+index
      params.push(server)
      index++
    }
    return new Promise((resolve, reject) => {
      this.query(query, params).then(res=>{
        this._ensureCommandExists(res, trigger, PERM_USER, role, server).then(command=>{
          resolve(command)
        }).catch(e=>{
          console.error(e)
        })
      }).catch(e=>{
        console.error(e)
      })
    })
  }
  initializeTables (message) {
    // callback hell
    return new Promise((resolve, reject) => {
      this.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'users\')').then(res => {
        if (res.rows[0].exists === true) {
          resolve()
        } else {
          // table doesnt exist... start creating them
          this.query('CREATE TABLE users (user_id VARCHAR(18) NOT NULL, permission BYTE NOT NULL, server_id VARCHAR(18), UNIQUE(user_id, server_id))').then(res => {
            console.log('Created users table...')
            this.query('INSERT INTO users (user_id, permission, server_id) VALUES ($1, $2, $3)', [message.channel.guild.ownerID, PERM_ADMIN, message.channel.guild.id]).then(res => {
              console.log('Added superadmin...')
              this.query('CREATE TABLE commands (trigger VARCHAR(25) NOT NULL, permission BYTE NOT NULL, role_id VARCHAR(18), server_id VARCHAR(18), UNIQUE(trigger, server_id))').then(res => {
                console.log('Created commands table...')
                resolve()
              })
            })
          })
        }
      })
    })
  }
  save (object) {
    console.log('SERVER (save): '+object.serverId)
    if (!(object instanceof User || object instanceof Command)) {
      throw new TypeError('User or Command object exapected, ' + typeof object + ' given')
    }
    return new Promise((resolve, reject) => {
      if (object instanceof User) {
        this.query('INSERT INTO users(user_id, permission, server_id) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT users_user_id_server_id_key DO UPDATE SET permission=$2', [object.id, object.permission, object.serverId]).then(res => {
          resolve()
        })
      } else {
        this.query('INSERT INTO commands(trigger, permission, role_id, server_id) VALUES($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT commands_trigger_server_id_key DO UPDATE SET permission=$2', [object.trigger, object.permission, object.roleId, object.serverId]).then(res => {
          resolve()
        })
      }
    })
  }
}

module.exports = Database
