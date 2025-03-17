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
    allowNull: false,
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
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  godzinyPrzepracowane: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nadgodziny50: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nadgodziny100: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nieobecnosc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stawkaBrutto: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  noteTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  noteDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});


users.hasMany(work_hours, { foreignKey: "user_id" }); 
work_hours.belongsTo(users, { foreignKey: "user_id" }); 

sequelize.sync({ alter: true }).then(() => {
  console.log("Baza danych i modele zostały zsynchronizowane.");
});

module.exports = { sequelize, users, work_hours };
