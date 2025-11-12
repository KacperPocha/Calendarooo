const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
require("dotenv").config();
const { sequelize } = require("./db");
const passport = require("passport");
const { users } = require("./db");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        let user = await users.findOne({ where: { googleId } });
        if (user) {
          return done(null, user);
        }

        user = await users.findOne({ where: { email } });
        if (user) {
          user.googleId = googleId;
          user.verified = true;
          await user.save();
          return done(null, user);
        }

        const newUser = await users.create({
          googleId,
          email,
          username: profile.displayName,
          password: null,
          verified: true,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);


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








