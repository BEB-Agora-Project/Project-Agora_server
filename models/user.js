'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    user.init(
        {
            email: {
                type:DataTypes.STRING(30),
                allowNull: false, //필수값
            },
            userName: {
                type:DataTypes.STRING(30),
                allowNull: false, //필수값
            },
            password: {
                type:DataTypes.STRING(100),
                allowNull: false, //필수값
            },
            address: {
                type:DataTypes.STRING(100),
                allowNull: true,
            },
            privateKey: {
                type:DataTypes.STRING(100),
                allowNull: true,
            },
            token: {
                type:DataTypes.INTEGER(100),
                allowNull: false,
                defaultValue: 0
            },
            todayLogin: {
                type:DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'user',
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );
    user.associate = function (models) {
        user.hasMany(models.board,{
            foreignKey: "userId",
            sourceKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        user.hasMany(models.comment,{
            foreignKey: "userId",
            sourceKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };
    return user;
};