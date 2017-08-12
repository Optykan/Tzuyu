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
          return new Promise((resolve, reject)=>{
            resolve(res)
          })
        }) 
      }else{
        this.connection.query(query, (err, res)=>{
          if(err) { throw err }
          return new Promise((resolve, reject)=>{
            resolve(res)
          })
        })
      }
    } 
  })
}

module.exports = Database