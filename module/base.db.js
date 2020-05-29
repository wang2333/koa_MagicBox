const Config = require('./config')
const { MongoClient } = require('mongodb')

class Db {
  static getInstance() {
    if (!Db.instance) {
      Db.instance = new Db()
    }
    return Db.instance
  }
  constructor() {
    // 实例共享
    this.dbClient = ''
    this.connect()
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.dbClient) {
        resolve(this.dbClient)
      } else {
        MongoClient.connect(
          Config.dbUrl,
          { useUnifiedTopology: true },
          (err, client) => {
            if (err) {
              reject(err)
            } else {
              const db = client.db(Config.dbName)
              this.dbClient = db
              resolve(db)
            }
          }
        )
      }
    })
  }

  find(collectionName, json = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        const result = db.collection(collectionName).find(json)
        result.toArray((err, data) => {
          if (err) {
            reject(err)
            return
          }
          resolve(data)
        })
      })
    })
  }

  insertOne(collectionName, json = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertOne(json, (err, result) => {
          if (err) {
            reject(err)
            return
          }
          resolve(result)
        })
      })
    })
  }

  insertMany(collectionName, arr  ) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertMany(arr, (err, result) => {
          if (err) {
            reject(err)
            return
          }
          resolve(result)
        })
      })
    })
  }

  update(collectionName, json1 = {}, json2 = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).updateOne(
          json1,
          { $set: json2 },
          (err, result) => {
            if (err) {
              reject(err)
              return
            }
            resolve(result)
          }
        )
      })
    })
  }

  remove(collectionName, json = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).removeOne(json, (err, result) => {
          if (err) {
            reject(err)
            return
          }
          resolve(result)
        })
      })
    })
  }
}

module.exports = Db.getInstance()
