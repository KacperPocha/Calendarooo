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








