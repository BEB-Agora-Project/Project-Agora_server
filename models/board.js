'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class board extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    board.init(
        {
            title: {
                type:DataTypes.STRING(30),
                // 자주사용되는 자료형 STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
                allowNull: false, //필수값
            },
            content: {
                type:DataTypes.STRING(500),
                allowNull: false, //필수값
            },
            hit: {
                type:DataTypes.INTEGER(30),
                allowNull: true, //필수값,
                defaultValue: 0
            },
        },
        {
            sequelize,
            modelName: 'board',
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );


    board.associate = function (models) {
        board.belongsTo(models.user, {
            foreignKey: "userId",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        })
        board.hasMany(models.comment,{
            foreignKey: "boardId",
            sourceKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'});
    };
    return board;
};