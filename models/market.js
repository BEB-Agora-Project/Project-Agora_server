"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class market extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  market.init(
    {
      tokenId: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
      },
      tokenURI: {
        type: DataTypes.STRING(500),
        allowNull: false, //필수값
      },
      price: {
        type: DataTypes.INTEGER(30),
        allowNull: true, //필수값,
        defaultValue: 0,
      },
      owner: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: "server",
      },
      ownerAddress: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: "serverAddress",
      },
      sold: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: "market",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );

  market.associate = function (models) {
    market.belongsTo(models.user, {
      foreignKey: "userId",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return market;
};
