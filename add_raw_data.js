const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbsqlite = new sqlite3.Database('./db.db', err => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the coinkeeper database.');
});

fs.readFile('./csvjson.json', 'utf8', (err, data) => {
    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {
        // parse JSON string to JSON object
        const databases = JSON.parse(data);

        // print all databases
        databases.forEach(db => {
            dbsqlite.run(`INSERT INTO coinkeeper(
                'Data',
                'Type',
                '_From',
                '_To',
                'Tags',
                'Amount',
                'Currency',
                'Amount_converted',
                'Currency_of_conversion',
                'Recurrence',
                'Note') VALUES(?,?,?,?,?,?,?,?,?,?,?)`, [db.Data,
                db.Type,
                db.From,
                db.To,
                db.Tags,
                db.Amount,
                db.Currency,
                db['Amount converted'],
                db['Currency of conversion'],
                db.Recurrence,
                db.Note], function (e) {
                if (e) {
                    return console.log(e.message);
                }
                // get the last insert id
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
        });
    }
});
