"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NormalItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  NormalItem.init(
    {
      itemname: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER(30),
        allowNull: false, //필수값
      },
    },
    {
      sequelize,
      modelName: "NormalItem",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  NormalItem.associate = function (models) {
    NormalItem.hasMany(models.NormalItemList, {
      foreignKey: "normal_item_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return NormalItem;
};
