"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Board extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Board.init(
    {
      boardname: {
        type: DataTypes.STRING(500),
        allowNull: false, //필수값
      },
    },
    {
      sequelize,
      modelName: "Board",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );

  Board.associate = function (models) {
    Board.hasMany(models.Post, {
      foreignKey: "board_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return Board;
};
