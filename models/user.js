'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: DataTypes.INTEGER,
    user_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    user_type: DataTypes.ENUM('user', 'admin'),
    credits: DataTypes.INTEGER,
    storage_used: DataTypes.FLOAT,
    storage_free: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};