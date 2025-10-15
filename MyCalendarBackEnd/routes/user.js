const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const {
  users,
  work_hours,
  userSettings,
  monthly_settings,
  sequelize,
} = require("../db");
const authenticateToken = require("../utils/authMiddleware");
const { default: axios } = require("axios");

router.get("/profile", authenticateToken, async (req, res) => {
  const user = await users.findOne({ where: { user_id: req.user.userID } });
  if (!user)
    return res.status(404).json({ message: "Nie znaleziono użytkownika" });
  res.json({ userID: user.user_id, username: user.username, rate: user.rate });
});

router.get("/get-user-hours/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const hours = await work_hours.findAll({ where: { user_id: userID } });
    res.json(hours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

router.get("/get-user-info/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const user = await users.findOne({ where: { user_id: userID } });
    if (!user)
      return res.status(400).json({ message: "Użytkownik nie istnieje" });
    res.json({
      userID: user.user_id,
      username: user.username,
      rate: user.rate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/get-calendar-data/:userID/:year/:month", async (req, res) => {
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

    res.json(workHours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/get-popup-data/:userID/:date", async (req, res) => {
  try {
    const { userID, date } = req.params;
    const record = await work_hours.findOne({
      where: { user_id: userID, data: date },
    });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/notatki/:userID/:year/:month", async (req, res) => {
  try {
    const { userID, year, month } = req.params;

    const notes = await work_hours.findAll({
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

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.put("/update-work-hours/:userID/:date", async (req, res) => {
  const { userID, date } = req.params;
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  const {
    godzinyPrzepracowane,
    nadgodziny50,
    nadgodziny100,
    nieobecnosc,
    noteTitle,
    noteDescription,
  } = req.body;

  try {
    let entry = await work_hours.findOne({
      where: { user_id: userID, data: formattedDate },
    });
    if (!entry) {
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

    await entry.update({
      godzinyPrzepracowane,
      nadgodziny50,
      nadgodziny100,
      nieobecnosc,
      noteTitle,
      noteDescription,
    });
    res.json({ message: "Godziny zostały zaktualizowane" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.put("/delete-note/:userID/:date", async (req, res) => {
  try {
    const { userID, date } = req.params;
    const record = await work_hours.findOne({
      where: { user_id: userID, data: date },
    });
    if (!record)
      return res.status(404).json({ message: "Nie znaleziono notatki." });
    await record.update({ noteTitle: null, noteDescription: null });
    res.json({ message: "Notatka została usunięta" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/get-settings/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const settings = await userSettings.findOne({ where: { user_id: userID } });
    if (!settings) return res.status(404).json({ message: "Brak ustawień dla użytkownika" });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.put("/update-settings/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    console.log(userID);
    const {
      typeOfJobTime,
      rateType,
      over26,
      vacationDays,
      rate,
      constAddons,
      nightAddon,
    } = req.body;

    let settings = await userSettings.findOne({ where: { user_id: userID } });

    if (!settings) {
      await userSettings.create({
        user_id: userID,
        typeOfJobTime,
        rateType,
        over26,
        vacationDays,
        rate,
        constAddons,
        nightAddon,
      });
      return res.status(201).json({ message: "Dane zostały dodane do bazy" });
    }

    await settings.update({
      typeOfJobTime,
      rateType,
      over26,
      vacationDays,
      rate,
      constAddons,
      nightAddon,
    });

    res.json({ message: "Dane zostały zaktualizowane" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/get-monthly-settings/:userID/:year/:month", async (req, res) => {
  const { userID, year, month } = req.params;
  try {
    let monthly = await monthly_settings.findOne({
      where: { user_id: userID, year, month },
    });
    if (!monthly) {
      const mainSettings = await userSettings.findOne({
        where: { user_id: userID },
      });

      if (!mainSettings) {
        return res
          .status(404)
          .json({ message: "Brak głównych ustawień użytkownika." });
      }

      monthly = await monthly_settings.create({
        user_id: userID,
        year,
        month,
        typeOfJobTime: mainSettings.typeOfJobTime,
        rateType: mainSettings.rateType,
        over26: mainSettings.over26,
        vacationDays: mainSettings.vacationDays,
        rate: mainSettings.rate,
        nightAddon: mainSettings.nightAddon,
        constAddons: mainSettings.constAddons,
      });
    }

    res.json(monthly);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.put(
  "/update-monthly-settings/:userID/:year/:month",
  async (req, res) => {
    const { userID, year, month } = req.params;
    const updateData = req.body;

    try {
      const [updated] = await monthly_settings.update(updateData, {
        where: { user_id: userID, year, month },
      });

      if (!updated) {
        return res
          .status(404)
          .json({ message: "Nie znaleziono ustawień do aktualizacji" });
      }

      res.json({ message: "Zaktualizowano ustawienia miesięczne" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Bład podczas aktualizacji" });
    }
  }
);

module.exports = router;
