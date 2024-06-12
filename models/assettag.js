'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AssetTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AssetTag.init({
    asset_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    tag_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AssetTag',
  });
  return AssetTag;
};