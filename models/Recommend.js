"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Recommend extends Model {
        static associate(models) {}
    }
    Recommend.init(
        {
            state: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Recommend",
            charset: "utf8",
            collate: "utf8_general_ci",
            underscored: true,
        }
    );

    Recommend.associate = function (models) {
        Recommend.belongsTo(models.Post, {
            foreignKey: "post_id",
            targetKey: "id",
            onDelete: "cascade",
            onUpdate: "cascade",
        });
        Recommend.belongsTo(models.Comment, {
            foreignKey: "comment_id",
            targetKey: "id",
            onDelete: "cascade",
            onUpdate: "cascade",
        });
        Recommend.belongsTo(models.User, {
            foreignKey: "user_id",
            targetKey: "id",
            onDelete: "cascade",
            onUpdate: "cascade",
        });
    };

    return Recommend;
};
