"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MarketItem extends Model {
    static associate(models) {}
  }
  MarketItem.init(
    {
      token_id: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
      },
      token_uri: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        defaultValue: 0,
      },
      sold: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: "MarketItem",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );

  MarketItem.associate = function (models) {
    MarketItem.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return MarketItem;
};
