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
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  rate: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

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
});

users.hasMany(work_hours, { foreignKey: "user_id" });
work_hours.belongsTo(users, { foreignKey: "user_id" });

// 🔧 Pełny reset (tylko raz, lub gdy testujesz)
sequelize.sync()

// Później zmień na:
// sequelize.sync();

module.exports = { sequelize, users, work_hours };
