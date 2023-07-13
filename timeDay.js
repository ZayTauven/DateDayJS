const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const moment = require('moment');

const app = express();
const port = 8081;
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'historique_dd',
});


connection.connect((err) => {
  if (err) {
    console.error('Echec lors de la connexion :', err);
    return;
  }
  console.log('Connection réussi');
});

app.use(bodyParser.json());
app.get('/dayfinder', (req, res) => {
  const { date } = req.query;
  
  if (!date || !moment(date, 'DD-MM-YYYY', true).isValid()) {
    return res.status(400).send('Suivez le format "jj-mm-aaaa".');
  }

  const formattedDate = moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY');
  const dayOfWeek = moment(date, 'DD-MM-YYYY').format('dddd');
  const searchDate = moment().format('DD/MM/YYYY HH:mm:ss');
const requestDate = moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY');
const insertQuery = 'INSERT INTO historique (searchDate, requestDate, dayOfWeek) VALUES (?, ?, ?)';
connection.query(insertQuery, [searchDate, requestDate, dayOfWeek], (err, result) => {
  if (err) {
    console.error('Erreur lors de l\'enregistrement de la date :', err);
  }
});

  res.json({ date: formattedDate, dayOfWeek });
});

app.get('/dayfinder/historique', (req, res) => {
  const selectQuery = 'SELECT id, searchDate, requestDate, dayOfWeek FROM historique';
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'historique :', err);
      return res.status(500).send('Une erreur survenue lors de la récupération de l\'historique des dates.');
    }

    const historique = results.map(result => ({
      id: result.id,
      searchDate: moment(result.searchDate, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY HH:mm:ss'),
      searchItems: {
        request: result.requestDate,
        response: {
          date: result.requestDate,
          day: result.dayOfWeek
        }
      }
    }));

    res.json(historique);
  });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
