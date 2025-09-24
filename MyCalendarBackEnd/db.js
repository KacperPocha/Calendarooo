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
  rate: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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

sequelize.sync();

module.exports = { sequelize, users, work_hours };
