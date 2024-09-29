const { MongoClient } = require('mongodb');

const uri = 'your_mongodb_connection_string';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('your_database_name');
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectDB;
