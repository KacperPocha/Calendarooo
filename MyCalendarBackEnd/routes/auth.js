const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { users } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const JWT_SECRET = process.env.JWT_SECRET;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], 
    session: false, 
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=true", 
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { userID: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.redirect(
      `http://localhost:5173/auth/callback?token=${token}&userID=${user.user_id}&username=${user.username}`
    );
  }
);

router.post("/register", async (req, res) => {
  const { username, email, password, rate } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Login, Email i hasło są wymagane!" });

  if (!passwordRegex.test(password))
    return res.status(400).json({
      message:
        "Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!",
    });

  const exists = await users.findOne({ where: { [Op.or]: [{ email }, { username }] } });
  if (exists)
    return res.status(400).json({ message: "Użytkownik z takim mailem lub loginem już istnieje" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await users.create({ username, email, password: hash, rate: rate || 0, verified: false });

  const token = jwt.sign({ userID: newUser.user_id }, JWT_SECRET, { expiresIn: "1d" });
  const verifyLink = `http://localhost:3000/api/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Potwierdź swój adres e-mail Calendaroo",
    html: `<p>Kliknij, aby aktywować konto: <a href="${verifyLink}">${verifyLink}</a></p>`,
  });

  res.status(201).json({ message: "Utworzono konto, sprawdź maila aby aktywować konto", userID: newUser.user_id });
});


router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await users.update({ verified: true }, { where: { user_id: decoded.userID } });
    res.redirect("http://localhost:5173/verify-email?verified=true");
  } catch (err) {
    res.redirect("http://localhost:5173/verify-error?reason=expired");
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Login i hasło są wymagane" });

  const user = await users.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: "Nieprawidłowy login lub użytkownik nie istnieje" });
  if (!user.verified) return res.status(400).json({ message: "Konto nie jest zweryfikowane przez email!" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Nieprawidłowe hasło" });

  const token = jwt.sign({ userID: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Zalogowano", token, userID: user.user_id, username: user.username });
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await users.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: "Nie ma takiego maila" });

  const token = jwt.sign({ userID: user.user_id }, JWT_SECRET, { expiresIn: "1h" });
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Reset hasła",
    html: `<p>Kliknij, aby zresetować hasło: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  res.json({ message: "Mail z linkiem resetującym został wysłany." });
});


router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!passwordRegex.test(password))
    return res.status(400).json({
      message: "Hasło nie spełnia wymagań bezpieczeństwa!",
    });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hash = await bcrypt.hash(password, 10);
    await users.update({ password: hash }, { where: { user_id: decoded.userID } });
    res.json({ message: "Hasło zostało zmienione" });
  } catch (err) {
    res.status(400).json({ message: "Sesja wygasła" });
  }
});

module.exports = router;
