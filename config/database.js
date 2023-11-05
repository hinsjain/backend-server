require("dotenv").config();

const {Sequelize} = require("sequelize");
const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        dialect: "mysql",
        host: process.env.DB_HOST,
        pool:{
          max: 5,
          min: 0,
          idle: 10000,
          acquire: 30000
        }
    },
);

module.exports = db;