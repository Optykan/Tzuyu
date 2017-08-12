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
      users: {}
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
  initializeTables(database, message){
    //callback hell
    if(!this.hasConnection()){
      this.provideConnection(database)
    }
    return new Promise((resolve, reject)=>{
      this.db.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'users\')').then(res => {
        if (res.rows[0].exists === true) {
          resolve(true)
        } else {
          // table doesnt exist... start creating them
          this.db.query('CREATE TABLE users (user_id VARCHAR(18) PRIMARY KEY, permission SMALLINT)', (err, res) => {
            console.log('Created users table...')
            this.db.query('INSERT INTO users (user_id, permission) VALUES ($1, $2)', [message.channel.guild.ownerID, PERM_ADMIN]).then(res => {
              console.log('Added superadmin...')
              this.db.query('CREATE TABLE commands (trigger VARCHAR(25) NOT NULL, permission SMALLINT, role_id VARCHAR(18))').then(res => {
                console.log('Created commands table...')
                resolve(true)
              })
            })
          })
        }
      })
    })
  }
}

module.exports = Database