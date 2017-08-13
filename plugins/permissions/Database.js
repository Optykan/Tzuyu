const Command = require('./Command')
const User = require('./User')

const PERM_ADMIN = 3
const PERM_MOD = 2
const PERM_USER = 1

class Database{
  constructor(){ }
  provideConnection(connection){
    this.connection = connection
  }
  hasConnection(){
    return this.connection !== undefined
  }
  query(query, params){
    return new Promise((resolve, reject)=>{
      if(params){
        this.connection.query(query, params, (err, res)=>{
          if(err) { throw err }
          resolve(res)
        }) 
      }else{
        this.connection.query(query, (err, res)=>{
          if(err) { throw err }
          resolve(res)
        })
      }
    })
  }
  getAllTables(){
    var result = {
      users: {},
      commands: {}
    }
    return new Promise((resolve, reject)=>{
      this.query('SELECT * FROM users').then(res => {
        result.users = res.rows
        this.query('SELECT * FROM commands').then(res => {
          result.commands = res.rows
          resolve(result)
        })
      })
    })
  }
  _createNewUser(id, permission, server){
    let user = (new User).fromParams(id, permission, server)

    return new Promise((resolve, reject)=>{
      this.update(user).then(res=>{
        resolve(user)
      })
    })
  }
  _checkIfExists(dbResult){

    return new Promise((resolve, reject)=>{
      if(dbResult.rowCount===0){
        this._createNewUser(id, PERM_USER, server).then(user=>{
          resolve(user)
        })
      }
      resolve((new User).fromDatabase(res[0]))
    })
  }
  getUser(id, server){
    // console.log('querying user...')
    return new Promise((resolve, reject)=>{
      if(server){
        this.query('SELECT * FROM users WHERE user_id=$1 AND server_id=$2', [id, server]).then(res=>{

          
        })
      }else{
        this.query('SELECT * FROM users WHERE user_id=$1', id).then(res=>{
          if(res.rowCount===0){
            this._createNewUser(id, PERM_USER, server).then(user=>{
              resolve(user)
            })
          }
          resolve((new User).fromDatabase(res[0]))
        })
      }
    })
  }
  initializeTables(message){
    //callback hell
    return new Promise((resolve, reject)=>{
      this.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'users\')').then(res => {
        if (res.rows[0].exists === true) {
          resolve()
        } else {
          // table doesnt exist... start creating them
          this.query('CREATE TABLE users (user_id VARCHAR(18) NOT NULL, permission SMALLINT NOT NULL, server_id VARCHAR(18));'
                         + 'CREATE UNIQUE INDEX UniqueUserIndex ON users(user_id, server_id);').then(res => {
            console.log('Created users table...')
            this.query('INSERT INTO users (user_id, permission, server_id) VALUES ($1, $2, $3)', [message.channel.guild.ownerID, PERM_ADMIN, message.channel.guild.id]).then(res => {
              console.log('Added superadmin...')
              this.query('CREATE TABLE commands (trigger VARCHAR(25) NOT NULL, permission SMALLINT NOT NULL, role_id VARCHAR(18), server_id VARCHAR(18));'
                            + 'CREATE UNIQUE INDEX UniqueCommandIndex ON commands(trigger, server_id);').then(res => {
                console.log('Created commands table...')
                resolve()
              })
            })
          })
        }
      })
    })
  }
  update(object){
    return new Promise((resolve, reject)=>{
      if(!(object instanceof User || object instanceof Command)){
        throw new TypeError('User or Command object exapected, '+typeof object +' given')
      }
      if(object instanceof User){
        this.query('REPLACE INTO users(user_id, permission, server_id) VALUES ($1, $2, $3)', [object.id, object.permission, object.serverId]).then(res=>{
          resolve()
        })
      }else{
        this.query('REPLACE INTO commands(trigger, permission, role_id, server_id) VALUES($1, $2, $3, $4)', [object.trigger, object.permission, object.roleId, object.serverId]).then(res=>{
          resolve()
        })
      }
    })
  }
}

module.exports = Database