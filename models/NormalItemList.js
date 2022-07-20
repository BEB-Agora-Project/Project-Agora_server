"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Normalitemlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Normalitemlist.init(
    {},
    {
      sequelize,
      modelName: "Normalitemlist",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Normalitemlist.associate = function (models) {
    Normalitemlist.belongsTo(models.Normalitem, {
      foreignKey: "normal_item_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Normalitemlist.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return Normalitemlist;
};
