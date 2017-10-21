'use strict';

const mysql = require('mysql');

const PROCESS_DELAY = 5000;

connect()
  .then(run)
  .then(() => {
    log('Done!');
  })
  .catch((error) => {
    log(error);
  });

function run(connection) {
  return new Promise((resolve, reject) => {
    connection.query(`
      SELECT * FROM items
      ORDER BY id ASC
    `)
      .on('result', (row) => {
        log(`Processed row ${row.id}`);

        connection.pause();
        holdThreadBusy(PROCESS_DELAY);
        connection.resume();
      })
      .on('error', reject)
      .on('end', resolve);
  });
}

function holdThreadBusy(ms) {
  log(`Holding thread busy for ${ms}ms...`)
  const startTime = getTime();
  let currentTime;

  do {
    doJSONstuff();
    currentTime = getTime();
  } while(startTime + ms > currentTime);
}

function getTime() {
  return new Date().getTime();
}

function connect() {
  const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'test',
    database: 'test'
  });
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
    
      resolve(connection)
    });
  });
}

function log(message) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${message}`);
}

function doJSONstuff() {
  const obj = {};

  for (let i = 0; i < 100000; i++) {
    obj[i] = i;
  }

  JSON.parse(JSON.stringify(obj))
}
