const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
require("dotenv").config();
const { sequelize } = require("./db");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

const PORT = process.env.PORT;

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

app.use(express.json());
app.use(cors());


app.use("/api", authRouter);
app.use("/api", userRouter);


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


sequelize.sync().then(() => console.log("Baza danych została zsynchronizowana."));


server.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));








/*const express = require("express");
const { Op } = require("sequelize");
const { sequelize, users, work_hours } = require("./db");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, rate } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Login, Email i hasło są wymagane!" });

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!",
      });
    }

    const exists = await users.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });
    if (exists)
      return res
        .status(400)
        .json({
          message: "Użytkownik z takim mailem lub loginem już istnieje",
        });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await users.create({
      username,
      email,
      password: hash,
      rate: rate || 0,
      verified: false,
    });

    const token = jwt.sign({ userID: newUser.user_id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    const verifyLink = `http://localhost:3000/api/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Potwierdź swój adres e-mail Calendaroo",
      html: `<p>Kliknij, aby aktywować konto: <a href="${verifyLink}">${verifyLink}</a></p>`,
    });

    return res.status(201).json({
      message: "Utworzono konto, sprawdź maila aby aktywować konto",
      userID: newUser.user_id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd serwera" });
  }
});

app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await users.update(
      { verified: true },
      { where: { user_id: decoded.userID } }
    );
    res.redirect("http://localhost:5173/verify-email?verified=true");
  } catch (err) {
    res.redirect("http://localhost:5173/verify-error?reason=expired");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Login i hasło są wymagane" });

    const user = await users.findOne({ where: { username } });

    if (!user)
      return res
        .status(400)
        .json({ message: "Nieprawidłowy login lub użytkownik nie istnieje" });

    if (!user.verified) {
      return res
        .status(400)
        .json({ message: "Konto nie jest zweryfikowane przez email!" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Nieprawidłowe hasło" });

    const token = jwt.sign(
      { userID: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({
      message: "Zalogowano",
      token,
      userID: user.user_id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    return res.status(201).json({ message: "Błąd serwera" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await users.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: "Nie ma takiego maila" });

  const token = jwt.sign({ userID: user.user_id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Reset hasła",
    html: `<p>Kliknij, aby zresetować hasło: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  res.json({ message: "Mail z linkiem resetującym został wysłany." });
});

app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Hasło nie spełnia wymagań bezpieczeństwa! Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!",
      });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hash = await bcrypt.hash(password, 10);

    await users.update(
      { password: hash },
      { where: { user_id: decoded.userID } }
    );
    res.json({ message: "Hasło zostało zmienione" });
  } catch (err) {
    res.status(400).json({ message: "Sesja wygasła" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Brak tokenu" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Brak tokenu" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Nieprawidłowy token!" });
    req.user = user;
    next();
  });
}

app.get("/api/profile", authenticateToken, async (req, res) => {
  const user = await users.findOne({ where: { user_id: req.user.userID } });
  if (!user)
    return res.status(404).json({ message: "Nie znaleziono użytkownika" });
  res.json({ userID: user.user_id, username: user.username, rate: user.rate });
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
        data: date,
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
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  console.log(formattedDate);
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
        data: formattedDate,
      },
    });

    if (!existingEntry) {
      await work_hours.create({
        user_id: userID,
        data: formattedDate,
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
      Number(existingEntry.godzinyPrzepracowane) !==
        Number(godzinyPrzepracowane) ||
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
      return res
        .status(201)
        .json({ message: "Stawka została dodana do bazy danych" });
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
          sequelize.where(
            sequelize.fn("strftime", "%Y", sequelize.col("data")),
            year
          ),
          sequelize.where(
            sequelize.fn("strftime", "%m", sequelize.col("data")),
            month
          ),
        ],
        [Op.or]: [
          { noteTitle: { [Op.ne]: null } },
          { noteDescription: { [Op.ne]: null } },
        ],
      },
      attributes: ["data", "noteTitle", "noteDescription"],
      group: ["data"],
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

app.put("/api/delete-note/:userID/:date", async (req, res) => {
  const { userID, date } = req.params;

  try {
    const record = await work_hours.findOne({
      where: { user_id: userID, data: date }
    });

    if (!record) {
      return res.status(404).json({ message: "Nie znaleziono notatki." });
    }

    await record.update({
      noteTitle: null,
      noteDescription: null
    });

    res.json({ message: "Notatka została usunięta" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

*/


