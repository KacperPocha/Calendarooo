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
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  over26: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  nadgodziny50: DataTypes.INTEGER,
  nadgodziny100: DataTypes.INTEGER,
  nieobecnosc: DataTypes.STRING,
  stawkaBrutto: DataTypes.FLOAT,
  noteTitle: DataTypes.STRING,
  noteDescription: DataTypes.STRING,
  /*
  rateInThisMonth: DataTypes.FLOAT,
  */
});

users.hasMany(work_hours, { foreignKey: "user_id" });
work_hours.belongsTo(users, { foreignKey: "user_id" });

sequelize.sync();

module.exports = { sequelize, users, work_hours, userSettings };
