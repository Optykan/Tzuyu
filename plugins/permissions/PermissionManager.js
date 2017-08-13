const Database = require('./Database')
const PermissionError = require('./../../core/ext/PermissionError')
const Command = require('./Command')

const PERM_ADMIN = 3
const PERM_MOD = 2
const PERM_USER = 1

class PermissionManager{
  constructor(){
    // cache the permissions and users list
    this.db = new Database()
    // this.commands = undefined
    // this.users = undefined
  }
  // _loadCache(){
  //   if (!this.users) {
  //     return new Promise((resolve, reject)=>{
  //       this.db.getAllTables().then(res=>{
  //         this.commands = res.commands
  //         this.users = res.users
  //         resolve()
  //       })
  //     })
  //   }
  // }
  initialize(database, message){
    if(!this.db.hasConnection()){
      this.db.provideConnection(database)
    }
    return new Promise((resolve, reject)=>{
      this.db.initializeTables(message).then(res=>{
        resolve(true)
      })
    })
  }
  getUser(database, id, server){
    if(!this.db.hasConnection()){
      this.db.provideConnection(database)
    }
    // console.log('passing through to db...')
    return new Promise((resolve, reject)=>{
      this.db.getUser(id, server).then(user=>{
        resolve(user)
      })
    })
  }
  _canPerformAction(database, requester, action){
    if(!this.db.hasConnection()){
      this.db.provideConnection(database)
    }
    return new Promise((resolve, reject)=>{
      //see if we have the ability to perform this action
      this.db.query('SELECT users.permission FROM users INNER JOIN commands ON (users.permission>=commands.permission) WHERE users.user_id=$1 AND commands.trigger=$2', [requester, action]).then(res=>{
        if(res.rowCount > 0){
          resolve(true)
        }else{
          reject(new PermissionError('Insufficient priveleges to perform this command'))
        }

      })
    })
  }

  _updateUser(user){
    return new Promise((resolve, reject)=>{
      this.db.query('SELECT 1 FROM users WHERE user_id=$1', user).then(res => {
        if(res.rowCount === 1){
          this.db.query('UPDATE users SET permission=$1 WHERE user_id=$2', [perm, user]).then(res=>{
            resolve(true)
          })
        }else{
          this.db.query('INSERT INTO users(user_id, permission) VALUES($1, $2)', [user, perm]).then(res=>{
            resolve(true)
          })
        }
      })      
    })
  }

  _restrictCommandLevel(command){
    if(!(command instanceof Command)){
      throw new TypeError('Command object expected, '+ typeof command+' given')
    }
    return new Promise((resolve, reject)=>{
      this.db.query('SELECT 1 FROM commands WHERE trigger=$1', trigger).then(res => {
        //if the command exists then 
        if(res.rowCount === 1){
          if(role){
            this.db.query('UPDATE commands SET permission=$1,role_id=$2 WHERE trigger=$3', [newLevel, role, trigger]).then(res=>{
              resolve(true)
            })
          }else{
            this.db.query('UPDATE commands SET permission=$1,role_id=-1 WHERE trigger=$2', [newLevel, trigger]).then(res=>{
              resolve(true)
            })
          }
        }else{
          if(role){
            this.db.query('INSERT INTO commands(trigger, permission, role_id) VALUES($1, $2, $3)', [user, newLevel, role]).then(res=>{
              resolve(true)
            })
          }else{
            this.db.query('INSERT INTO commands(trigger, permission, role_id) VALUES($1, $2, -1)', [user, newLevel]).then(res=>{
              resolve(true)
            })
          }
        }
      })      
    })
  }
}

module.exports = PermissionManager