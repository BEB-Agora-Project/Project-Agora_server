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
        type: DataTypes.INTEGER(255),
        allowNull: false,
        defaultValue: 0,
      },
      expected_token: {
        type: DataTypes.INTEGER(255),
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
      profile_image: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      badge: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      is_auth: {
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
      underscored: true,
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
    User.hasMany(models.Reply, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    User.hasMany(models.Nftitem, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    User.hasMany(models.Normalitemlist, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    User.hasMany(models.Recommend, {
      foreignKey: "user_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return User;
};
