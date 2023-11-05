const {Sequelize, DataTypes} = require('sequelize'),
      sequelize = require('../config/database');

const Users = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    token: {
        type: DataTypes.STRING
    }
},
{
    timestamps: true
});

module.exports = Users;