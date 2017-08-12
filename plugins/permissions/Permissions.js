const Plugin = require('../Plugin')

const PERM_ADMIN = 1
// const PERM_MOD = 2
// const PERM_USER = 3

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
  }
  register () {
    return {
      trigger: ['mod', 'perms_generateTables', 'restrict'],
      action: [this.mod, this.initialize, this.restrict],
      injects: ['Tzuyu@tzuyu,Message@message,Database@database', 'Database@database,Tzuyu@tzuyu,Message@message'],
      help: {
        mod: 'Format: @user. Gives a user elevated privileges, granting them the ability to access restricted commands (restricted: mod)'
        initialize: 'Generates the tables required for the Permissions plugin to work. Run this once (restricted: server owner)'
        restrict: 'Format: <command>, where <command> does not include the prefix (!, &, whatever is set). Only allows moderators to use these commands (restricted: mod)'
      }
    }
  }
  initialize (database, tzuyu, message) {
    //welcome to callback hell
    tzuyu.message('Creating tables...')
    database.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'users\')', (err, res) => {
      if (err) { throw err }
      if(res.rows[0].exists === true){
        //table exists.... start caching things
        database.query('SELECT * FROM commands', (err, res)=>{
          if (err) { throw err }
          else { this.commands = res.rows }
        })
        database.query('SELECT * FROM users', (err, res)=>{
          if (err) { throw err }
          else { this.users = res.rows }
        })
      } else {
        //table doesnt exist... start creating them
        database.query('CREATE TABLE users (user_id VARCHAR(18) PRIMARY KEY, permission SMALLINT)', (err, res)=>{
          if (err) { throw err }
          if (res) {
            console.log(res)
          }
          database.query('INSERT INTO users (user_id, permission) VALUES ($1, $2)', [message.channel.guild.ownerID, PERM_ADMIN], (err, res)=>{
            if (err) { throw err }
            if (res){
              console.log(res)
            }
          })
        })
        database.query('CREATE TABLE commands (trigger VARCHAR(25) NOT NULL, permission SMALLINT, role_id VARCHAR(18))', (err, res)=>{
          if (err) { throw err }
          if (res) {
            console.log(res)
          }
        })
      }
      console.log(res)
    })
  }
  mod (tzuyu, message, database, ...params) {
    if (!this.permissions) {
      database.query('SELECT * FROM ')
    }
    if (!this.superAdmin) {
      this.superAdmin = message.channel.guild.ownerID
    }
    console.log(message)
  }
  restrict (command, level){

  }
}

module.exports = Permissions
