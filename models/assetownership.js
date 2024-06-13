'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AssetOwnership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AssetOwnership.init({
    ownership_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    asset_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    ownership_type: DataTypes.ENUM('owner', 'editor')
  }, {
    sequelize,
    modelName: 'AssetOwnership',
  });
  return AssetOwnership;
};