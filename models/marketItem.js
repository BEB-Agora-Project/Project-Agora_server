"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MarketItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MarketItem.init(
    {
      token_id: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
      },
      token_URI: {
        type: DataTypes.STRING(500),
        allowNull: false, //필수값
      },
      price: {
        type: DataTypes.INTEGER(30),
        allowNull: true, //필수값,
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
