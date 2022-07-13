"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      private_key: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      current_token: {
        type: DataTypes.INTEGER(100000),
        allowNull: false,
        defaultValue: 0,
      },
      expected_token: {
        type: DataTypes.INTEGER(100000),
        allowNull: false,
        defaultValue: 0,
      },
      today_vote_count: {
        type: DataTypes.INTEGER(100),
        allowNull: false,
        defaultValue: 0,
      },
      today_login: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  User.associate = function (models) {
    User.hasMany(models.Post, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    User.hasMany(models.Comment, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    User.hasMany(models.MarketItem, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return User;
};
