const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db",
});

const users = sequelize.define("user", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

const userSettings = sequelize.define("user_settings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: users,
      key: "user_id",
    },
    allowNull: false,
    onDelete: "CASCADE",
  },
  typeOfJobTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rateType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taxReliefType: {
    type: DataTypes.STRING,
    defaultValue: "brak",
  },
  PPK: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  tradeUnions: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  vacationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  nightAddon: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  constAddons: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});
users.hasOne(userSettings, { foreignKey: "user_id" });
userSettings.belongsTo(users, { foreignKey: "user_id" });

const work_hours = sequelize.define("work_hour", {
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: users,
      key: "user_id",
    },
  },
  data: DataTypes.DATEONLY,
  godzinyPrzepracowane: DataTypes.INTEGER,
  godzinyNocne: DataTypes.INTEGER,
  nadgodziny50: DataTypes.INTEGER,
  nadgodziny100: DataTypes.INTEGER,
  nadgodziny50Nocne: DataTypes.INTEGER,
  nadgodziny100Nocne: DataTypes.INTEGER,
  silaWyzsza: DataTypes.FLOAT,
  nieobecnosc: DataTypes.STRING,
});

const notes = sequelize.define("note", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: users,
      key: "user_id",
    },
    onDelete: "CASCADE",
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

users.hasMany(notes, { foreignKey: "user_id" });
notes.belongsTo(users, { foreignKey: "user_id" });

work_hours.hasMany(notes, {
  foreignKey: "data",
  sourceKey: "data",
  constraints: false,
});

const monthly_settings = sequelize.define(
  "monthly_settings",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: users, key: "user_id" },
      allowNull: false,
      onDelete: "CASCADE",
    },
    year: DataTypes.INTEGER,
    month: DataTypes.INTEGER,

    typeOfJobTime: DataTypes.STRING,
    rateType: DataTypes.STRING,
    taxReliefType: DataTypes.STRING,
    PPK: DataTypes.FLOAT,
    tradeUnions: DataTypes.FLOAT,
    vacationDays: DataTypes.INTEGER,
    rate: DataTypes.FLOAT,
    nightAddon: DataTypes.FLOAT,
    otherAddons: { type: DataTypes.FLOAT, defaultValue: 0 },
    constAddons: DataTypes.FLOAT,
  },
  { timestamps: true }
);

users.hasMany(work_hours, { foreignKey: "user_id" });
work_hours.belongsTo(users, { foreignKey: "user_id" });

const monthly_summaries = sequelize.define("monthly_summary", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: users, key: "user_id" },
    allowNull: false,
    onDelete: "CASCADE",
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  calculated_gross: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  calculated_net: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  hours_norm: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

users.hasMany(monthly_summaries, { foreignKey: "user_id" });
monthly_summaries.belongsTo(users, { foreignKey: "user_id" });

sequelize.sync();

module.exports = {
  sequelize,
  notes,
  users,
  work_hours,
  userSettings,
  monthly_settings,
  monthly_summaries,
};
