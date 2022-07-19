"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NormalItemList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  NormalItemList.init(
    {},
    {
      sequelize,
      modelName: "NormalItemList",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  NormalItemList.associate = function (models) {
    NormalItemList.belongsTo(models.NormalItem, {
      foreignKey: "normal_item_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    NormalItemList.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return NormalItemList;
};
