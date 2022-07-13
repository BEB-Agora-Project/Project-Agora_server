'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MarketItem extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    MarketItem.init(
        {
            token_id: {
                type:DataTypes.INTEGER(100),
                allowNull: false,
            },
            token_uri: {
                type:DataTypes.STRING(100),
                allowNull: false,
            },
            price: {
                type:DataTypes.INTEGER(30),
                allowNull: false, //필수값
            },
            sold: {
                type:DataTypes.BOOLEAN,
                allowNull: false, //필수값
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'MarketItem',
            charset: 'utf8',
            collate: 'utf8_general_ci',
            underscored:true
        }
    );

    MarketItem.associate = function(models){
        MarketItem.belongsTo(models.User, {
            foreignKey: "user_id",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };

    return MarketItem;
};