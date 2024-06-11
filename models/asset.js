'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Asset.init({
    asset_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    file_name: DataTypes.STRING,
    file_path: DataTypes.STRING,
    visibility: DataTypes.ENUM('Public', 'Private'),
    description: DataTypes.TEXT,
    category_id: DataTypes.INTEGER,
    download_count: DataTypes.INTEGER,
    asset_type: DataTypes.ENUM('Free', 'Paid')
  }, {
    sequelize,
    modelName: 'Asset',
  });
  return Asset;
};