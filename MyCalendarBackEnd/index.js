const express = require("express");
const { Op } = require("sequelize");
const { sequelize, users, work_hours } = require("./db");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const PORT = 3000;

app.use(express.json());
app.use(cors());

sequelize.sync().then(() => {
  console.log("Baza danych została zsynchronizowana.");
});

io.on("connection", (socket) => {
  console.log("Nowe połączenie WebSocket:", socket.id);

  socket.on("new-note", (noteData) => {
    console.log("Nowa notatka:", noteData);

    io.emit("update-notes", noteData);
  });

  socket.on("disconnect", () => {
    console.log("Połączenie zamknięte:", socket.id);
  });
});

app.get("/api/get-user-hours/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const work_hours = await work_hours.findAll({
      where: { user_id: userID },
    });
    res.json(work_hours);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.post("/api/add-user", async (req, res) => {
  try {
    const { username, rate } = req.body;
    const newUser = await users.create({ username, rate });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Błąd podczas tworzenia użytkownika" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await users.findOne({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "Użytkownik nie istnieje" });
    }
    res.json({
      message: "Logowanie pomyślne",
      userID: user.user_id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

app.get("/api/get-user-info/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const user = await users.findOne({
      where: { user_id: userID },
    });
    if (!user) {
      return res.status(400).json({ message: "Użytkownik nie istnieje" });
    }
    res.json({
      message: "Logowanie pomyślne",
      userID: user.user_id,
      username: user.username,
      rate: user.rate,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

app.get("/api/get-calendar-data/:userID/:year/:month", async (req, res) => {
  try {
    const { userID, year, month } = req.params;
    const monthFormatted = month.padStart(2, "0");

    const workHours = await work_hours.findAll({
      where: {
        user_id: userID,
        [Op.and]: [
          sequelize.where(
            sequelize.fn("strftime", "%Y", sequelize.col("data")),
            year
          ),
          sequelize.where(
            sequelize.fn("strftime", "%m", sequelize.col("data")),
            monthFormatted
          ),
        ],
      },
      order: [["data", "ASC"]],
    });

    console.log("workHours:", workHours);
    res.json(workHours);
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

app.get("/api/get-popup-data/:userID/:date", async (req, res) => {
  const { userID, date } = req.params;

  try {
    const record = await work_hours.findOne({
      where: {
        user_id: userID,
        data: sequelize.fn('DATE', sequelize.col('data')),
      },
    });



    res.json(record);
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

app.put("/api/update-work-hours/:userID/:date", async (req, res) => {
  const { userID, date } = req.params;
  const {
    godzinyPrzepracowane,
    nadgodziny50,
    nadgodziny100,
    nieobecnosc,
    noteTitle,
    noteDescription,
  } = req.body;

  try {
    const existingEntry = await work_hours.findOne({
      where: {
        user_id: userID,
        data: date,
      },
    });

    if (!existingEntry) {

      await work_hours.create({
        user_id: userID,
        data: date,
        godzinyPrzepracowane,
        nadgodziny50,
        nadgodziny100,
        nieobecnosc,
        noteTitle,
        noteDescription,
      });

      return res.json({ message: "Godziny zostały dodane do bazy danych" });
    }

    const isChanged =
      Number(existingEntry.godzinyPrzepracowane) !== Number(godzinyPrzepracowane) ||
      Number(existingEntry.nadgodziny50) !== Number(nadgodziny50) ||
      Number(existingEntry.nadgodziny100) !== Number(nadgodziny100) ||
      existingEntry.nieobecnosc !== nieobecnosc ||
      existingEntry.noteTitle !== noteTitle ||
      existingEntry.noteDescription !== noteDescription;

    if (!isChanged) {
      console.log("Brak zmian w danych.");
      return res.json({ message: "Godziny nie zostały zmienione" });
    }

    await existingEntry.update({
      godzinyPrzepracowane,
      nadgodziny50,
      nadgodziny100,
      nieobecnosc,
      noteTitle,
      noteDescription,
    });

    res.json({ message: "Godziny zostały zaktualizowane" });
  } catch (error) {
    console.error("Błąd podczas aktualizacji godzin:", error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

app.put("/api/updaterate/:userID", async (req, res) => {
  const { userID } = req.params;
  const { rate } = req.body;

  try {

    const user = await users.findOne({ where: { user_id: userID } });

    if (!user) {
   
      await users.create({
        user_id: userID,
        rate: rate,
      });

      console.log(`Stawka użytkownika ${userID} została dodana`);
      return res.status(201).json({ message: "Stawka została dodana do bazy danych" });
    }


    if (user.rate !== rate) {
      await user.update({ rate: rate });
      console.log(`Stawka użytkownika ${userID} została zaktualizowana`);
      return res.json({ message: "Stawka została zaktualizowana" });
    }

    res.json({ message: "Stawka nie została zmieniona" });
  } catch (error) {
    console.error("Błąd podczas aktualizacji stawki:", error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});



app.get("/api/notatki/:userID/:year/:month", async (req, res) => {
  const { userID, year, month } = req.params;

  try {
 
    const notatki = await work_hours.findAll({
      where: {
        user_id: userID,
        [Op.and]: [
          sequelize.where(sequelize.fn('strftime', '%Y', sequelize.col('data')), year),
          sequelize.where(sequelize.fn('strftime', '%m', sequelize.col('data')), month),
        ],
        [Op.or]: [
          { noteTitle: { [Op.ne]: null } },
          { noteDescription: { [Op.ne]: null } },
        ],
      },
      attributes: ['data', 'noteTitle', 'noteDescription'],
      group: ['data'],
    });




    res.json(notatki);
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error.message);
    res.status(500).json({ message: "Błąd serwera" });
  }
});



server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

/*
db.run(`
  CREATE TABLE IF NOT EXISTS work_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data DATE,
      godzinyPrzepracowane INTEGER,
      nadgodziny50 INTEGER,
      nadgodziny100 INTEGER,
      nieobecnosc TEXT,
      stawkaBrutto REAL,
      noteTitle TEXT,
      noteDescription TEXT,
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
  const {
    godzinyPrzepracowane,
    nadgodziny50,
    nadgodziny100,
    nieobecnosc,
    noteTitle,
    noteDescription,
  } = req.body;

  const query = `SELECT godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc, noteTitle, noteDescription FROM work_hours WHERE user_id = ? AND data = ?`;

  db.get(query, [userID, date], (err, row) => {
    if (err) {
      console.error("Błąd podczas sprawdzania godzin:", err.message);
      return res.status(500).json({ message: "Błąd serwera" });
    }

    if (!row) {
      // Jeśli brak danych, dodajemy nowe
      const insertQuery = `
        INSERT INTO work_hours (data, godzinyPrzepracowane, nadgodziny50, nadgodziny100, nieobecnosc, noteTitle, noteDescription, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        insertQuery,
        [
          date,
          godzinyPrzepracowane,
          nadgodziny50,
          nadgodziny100,
          nieobecnosc,
          noteTitle,
          noteDescription,
          userID,
        ],
        function (err) {
          if (err) {
            console.error("Błąd podczas dodawania godzin:", err.message);
            return res
              .status(500)
              .json({ message: "Błąd podczas dodawania danych" });
          }

          res.json({ message: "Godziny zostały dodane do bazy danych" });
        }
      );
    } else {
      // Jeśli dane istnieją, sprawdzamy, czy są różnice
      if (
        Number(row.godzinyPrzepracowane) !== Number(godzinyPrzepracowane) ||
        Number(row.nadgodziny50) !== Number(nadgodziny50) ||
        Number(row.nadgodziny100) !== Number(nadgodziny100) ||
        row.nieobecnosc !== nieobecnosc ||
        row.noteTitle !== noteTitle ||
        row.noteDescription !== noteDescription
      ) {
        const updateQuery = `
  UPDATE work_hours
  SET godzinyPrzepracowane = ?, nadgodziny50 = ?, nadgodziny100 = ?, nieobecnosc = ?, noteTitle = ?, noteDescription = ?
  WHERE user_id = ? AND data = ?
`;

        db.run(
          updateQuery,
          [
            godzinyPrzepracowane,
            nadgodziny50,
            nadgodziny100,
            nieobecnosc,
            noteTitle,
            noteDescription,
            userID,
            date,
          ],
          function (err) {
            if (err) {
              console.error("Błąd podczas aktualizacji danych:", err.message);
              return res
                .status(500)
                .json({ message: "Błąd podczas aktualizacji danych" });
            }

            res.json({ message: "Godziny zostały zaktualizowane" });
          }
        );
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
          return res
            .status(500)
            .json({ message: "Błąd podczas dodawania danych" });
        }
        console.log(`Stawka użytkownika ${userID} została dodana`);
        res
          .status(201)
          .json({ message: "Stawka została dodana do bazy danych" });
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
            return res
              .status(500)
              .json({ message: "Błąd podczas aktualizacji danych" });
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

app.get("/api/notatki/:userID/:year/:month", (req, res) => {
  const userID = req.params.userID;
  const year = req.params.year;
  const month = req.params.month;

  const query = `
      SELECT data, noteTitle, noteDescription
      FROM work_hours
      WHERE user_id = ? AND CAST(strftime('%Y', data) AS INTEGER) = ? AND CAST(strftime('%m', data) AS INTEGER) = ? AND (noteTitle IS NOT NULL OR noteDescription IS NOT NULL)

      GROUP BY data
  `;

  db.all(query, [userID, year, month], (err, rows) => {
    if (err) {
      console.error("Błąd podczas pobierania danych:", err.message);
      res.status(500).json({ message: "Błąd serwera" });
      return;
    }

    res.json(rows);
  });
});
*/
