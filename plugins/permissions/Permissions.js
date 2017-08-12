const Plugin = require('../Plugin')
const Database = require('./Database')

const PERM_ADMIN = 3
// const PERM_MOD = 2
// const PERM_USER = 1

class Permissions extends Plugin {
  constructor () {
    super()
    this.title = 'Permissions'
    this.desc = 'Does things for moderation'
    // this.help = undefined
    this.enabled = true

    // cache the permissions and users list
    this.commands = undefined
    this.users = undefined

    // the greatest person
    this.superAdmin = undefined

    this.db = new Database()
  }
  register () {
    return {
      trigger: ['mod', 'perms_generateTables', 'restrict'],
      action: [this.mod, this.initialize, this.restrict],
      injects: ['Tzuyu@tzuyu,Message@message,Database@database', 'Database@database,Tzuyu@tzuyu,Message@message', 'Message@message'],
      help: {
        mod: 'Format: `mod @user`. Gives a user elevated privileges, granting them the ability to access restricted commands (restricted: mod)',
        perms_generateTables: 'Generates the tables required for the Permissions plugin to work. Run this once (restricted: server owner)',
        restrict: 'Format: `restrict <command>`, where <command> does not include the prefix (!, &, whatever is set). Only allows moderators to use these commands (restricted: mod)'
      }
    }
  }
  initialize (database, tzuyu, message) {
    // welcome to callback hell
    if(!this.db.hasConnection()){
      this.db.provideConnection(database)
    }
    tzuyu.message('Creating tables...')
    this.db.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'users\')').then(res => {
      if (res.rows[0].exists === true) {
        // table exists.... start caching things
        this.db.query('SELECT * FROM commands').then(res => {
          this.commands = res.rows
        })
        this.db.query('SELECT * FROM users').then(res => {
          this.users = res.rows
        })
      } else {
        // table doesnt exist... start creating them
        this.db.query('CREATE TABLE users (user_id VARCHAR(18) PRIMARY KEY, permission SMALLINT)', (err, res) => {
          console.log(res)
          this.db.query('INSERT INTO users (user_id, permission) VALUES ($1, $2)', [message.channel.guild.ownerID, PERM_ADMIN]).then(res => {
            console.log(res)
          })
        })
        this.db.query('CREATE TABLE commands (trigger VARCHAR(25) NOT NULL, permission SMALLINT, role_id VARCHAR(18))').then(res => {
          console.log(res)
        })
      }
      console.log(res)
    })
  }
  _changePermissionLevel(user, perm){
    this.db.query('SELECT 1 FROM users WHERE user_id=$1', user).then(res => {
      if(res.rowCount === 1){
        this.db.query('UPDATE users SET permission=$1', perm).then(res=>{
          //do nothing...
        })
      }else{
        this.db.query('INSERT INTO users(user_id, permission) VALUES($1, $2)', [user, perm]).then(res=>{
          //do nothing again i guess...
        })
      }
    })

  }
  _getIdFromMessage(message){
    let res = /<@([0-9]{18})>/.exec(message)
    if(res){
      return res[1]
    }
    throw new Error('Could not resolve ID of user')
  }
  _modAfterSearch (tzuyu, msgSource, msgTarget) {
    try{
      var source = _getIdFromMessage(msgSource)
      var target = _getIdFromMessage(msgTarget)
    } catch(e){
      return tzuyu.message(e.message)
    }
    if(this.users.permission >= PERM_MOD){

    }
    
  }
  mod (tzuyu, message, database, param) {
    if(!this.db.hasConnection()){
      this.db.provideConnection(database)
    }
    // console.log(message)
    if (!this.users) {
      this.db.query('SELECT * FROM users').then(res => {
        this.users = res.rows
        this.db.query('SELECT * FROM commands').then(res => {
          this.commands = res
          this._modAfterSearch(tzuyu, message.author.id, target)
        })
      })
    } else {
      this._modAfterSearch(tzuyu, message.author.id, target)
    }
  }
  restrict (message, level) {
    console.log('body')
  }
}

module.exports = Permissions
