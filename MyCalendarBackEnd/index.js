const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors"); // Importowanie pakietu cors
const app = express();
const PORT = 3000;

// Middleware do parsowania JSON-a
app.use(bodyParser.json());

// Ustawienie CORS, aby zezwalać na żądania z frontendu
app.use(cors());

// Połączenie z bazą danych SQLite
const db = new sqlite3.Database("./database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS work_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data DATE,
      godzinyPrzepracowane INTEGER,
      nadgodziny50 INTEGER,
      nadgodziny100 INTEGER,
      nieobecnosc TEXT,
      stawkaBrutto REAL,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      rate INTEGER
    )
  `);

module.exports = db;

app.get("/api/get-user-hours/:userID", (req, res) => {
  const userID = req.params.userID;

  const query = `SELECT * FROM work_hours WHERE user_id = ?`;

  db.all(query, [userID], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Błąd podczas pobierania danych" });
      return;
    }

    res.json(rows);
  });
});

app.get("/api/get-user-info/:userID", (req, res) => {
  const userID = req.params.userID;

  const query = `SELECT * FROM users WHERE id = ?`;
  db.all(query, [userID], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Błąd podczas pobierania danych" });
      return;
    }
    res.json(rows);
  });
});


app.get("/api/get-calendar-data/:userID/:year/:month", (req, res) => {
  const userID = req.params.userID;
  const year = req.params.year;
  const month = req.params.month;
  const monthFormatted = month.padStart(2, "0");

  const query = `
      SELECT *
      FROM work_hours
      WHERE user_id = ? AND strftime('%Y', data) = ? AND strftime('%m', data) = ?
      GROUP BY data
  `;

  db.all(query, [userID, year, monthFormatted], (err, rows) => {
    if (err) {
      console.error("Błąd podczas pobierania danych:", err.message);
      res.status(500).json({ message: "Błąd serwera" });
      return;
    }

    res.json(rows);
  });
});

app.get("/api/get-popup-data/:userID/:date", (req, res) => {
  const userID = req.params.userID;
  const date = req.params.date;

  const query = `
    SELECT *
    FROM work_hours
    WHERE user_id = ? AND data = ?
  `;

  db.get(query, [userID, date], (err, row) => {
    if (err) {
      console.error("Błąd podczas pobierania danych:", err.message);
      res.status(500).json({ message: "Błąd serwera" });
      return;
    }
    if (!row) {
      res.json({ message: "Dane dla podanego dnia nie istnieją" });
      return;
    }
    res.json(row);
  });
});

app.put("/api/update-work-hours/:userID/:date", (req, res) => {
  const userID = req.params.userID;
  const date = req.params.date;
  const { godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc } = req.body;


  const query = `SELECT godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc FROM work_hours WHERE user_id = ? AND data = ?`;

  db.get(query, [userID, date], (err, row) => {
    if (err) {
      console.error("Błąd podczas sprawdzania godzin:", err.message);
      return res.status(500).json({ message: "Błąd serwera" });
    }

    if (!row) {
      // Jeśli brak danych, dodajemy nowe
      const insertQuery = `
        INSERT INTO work_hours (data, godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertQuery, [date, godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc, userID], function (err) {
        if (err) {
          console.error("Błąd podczas dodawania godzin:", err.message);
          return res.status(500).json({ message: "Błąd podczas dodawania danych" });
        }
   
        res.json({ message: "Godziny zostały dodane do bazy danych" });
      });
    } else {
      // Jeśli dane istnieją, sprawdzamy, czy są różnice
      if (
        Number(row.godzinyPrzepracowane) !== Number(godzinyPrzepracowane) ||
        Number(row.nadgodziny50) !== Number(nadgodziny50) ||
        Number(row.nadgodziny100) !== Number(nadgodziny100) ||
        row.nieobecnosc !== nieobecnosc
      ) {
        const updateQuery = `
          UPDATE work_hours
          SET godzinyPrzepracowane = ?, nadgodziny50 = ?, nadgodziny100 = ?, nieobecnosc = ?
          WHERE user_id = ? AND data = ?
        `;
        
        db.run(updateQuery, [godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc, userID, date], function (err) {
          if (err) {
            console.error("Błąd podczas aktualizacji danych:", err.message);
            return res.status(500).json({ message: "Błąd podczas aktualizacji danych" });
          }
          console.log("Zaktualizowano dane:", {
            godzinyPrzepracowane,
            nadgodziny50,
            nadgodziny100,
            nieobecnosc,
          });
          res.json({ message: "Godziny zostały zaktualizowane" });
        });
      } else {
        console.log("Brak zmian w danych, godziny nie zostały zaktualizowane.");
        res.json({ message: "Godziny nie zostały zmienione" });
      }
    }
  });
});



app.post("/api/calculate-salary", (req, res) => {
  const { godzinyPrzepracowane, stawkaBrutto } = req.body;

  const brutto = godzinyPrzepracowane * stawkaBrutto;
  const stawkaNetto = brutto * 0.75;

  res.json({ godzinyPrzepracowane, stawkaBrutto, brutto, stawkaNetto });
});

app.post("/login", (req, res) => {
  const { username } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Błąd serwera" });
    if (!user)
      return res.status(400).json({ message: "Użytkownik nie istnieje" });

    res.json({ message: "Logowanie pomyślne", userID: user.id });
  });
});

app.listen(5000, () => {
  console.log("Serwer działa na porcie 5000");
});

app.post("/add-user", (req, res) => {
  const { username } = req.body;

  db.run(`INSERT INTO users (username) VALUES (?)`, [username], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Błąd podczas dodawania danych" });
      return;
    }
    res.json({ message: "Dane zostały dodane do bazy!", id: this.lastID });
  });
});

app.get("/userslist", (req, res) => {
  const query = `SELECT * FROM users`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: "Błąd podczas pobierania danych" });
      return;
    }

    res.json(rows);
  });
});

app.delete("/users/:id", (req, res) => {
  const userID = req.params.id;
  const query = "DELETE FROM users WHERE id= ?";

  db.run(query, userID, function (err) {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: "Bład podczas usuwania" });
      return;
    }
    res.json({ message: "Użytkownik usunięty" });
  });
});


app.put("/api/updaterate/:userID", (req, res) => {
  const userID = req.params.userID;
  const { rate } = req.body;


  const query = `SELECT rate FROM users WHERE id = ?`;
  
  db.get(query, [userID], (err, row) => {
    if (err) {
      console.error("Błąd podczas szukania użytkownika", err.message);
      return res.status(500).json({ message: "Błąd serwera" });
    }

    if (!row) {
      const insertQuery = `
        INSERT INTO users (id, rate)
        VALUES (?, ?)
      `;
      db.run(insertQuery, [userID, rate], function (err) {
        if (err) {
          console.error("Błąd podczas dodawania stawki", err.message);
          return res.status(500).json({ message: "Błąd podczas dodawania danych" });
        }
        console.log(`Stawka użytkownika ${userID} została dodana`);
        res.status(201).json({ message: "Stawka została dodana do bazy danych" });
      });
    } else {
      if (row.rate !== rate) {
        const updateQuery = `
          UPDATE users
          SET rate = ?
          WHERE id = ?
        `;
        db.run(updateQuery, [rate, userID], function (err) {
          if (err) {
            console.error("Błąd podczas aktualizacji danych:", err.message);
            return res.status(500).json({ message: "Błąd podczas aktualizacji danych" });
          }
          console.log(`Stawka użytkownika ${userID} została zaktualizowana`);
          res.json({ message: "Stawka została zaktualizowana" });
        });
      } else {
        res.json({ message: "Stawka nie została zmieniona" });
      }
    }
  });
});
