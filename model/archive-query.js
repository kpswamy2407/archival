var Sequelize = require("sequelize");
module.exports=(sequelize,DataTypes)=>{
    const ArchiveQuery=sequelize.define('ArchiveQuery',{
        id:{
            type:DataTypes.INTEGER(19),
            autoIncrement:true,
            primaryKey: true,
        },
        vt_tabid:{
            type:DataTypes.INTEGER(19),
            defaultValue:0,
        },
        module_name:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        assoc_id:{
            type:DataTypes.INTEGER(19),
        },
        sel_query_template:{
            type:DataTypes.TEXT,
            defaultValue:null,
        },
        del_query_template:{
            type:DataTypes.TEXT,
            defaultValue:null,
        },
        sequence:{
            type:DataTypes.INTEGER(11),
            defaultValue:0,
        },
        created_by:{
            type:DataTypes.INTEGER,
        },
        created_time:{
            type:DataTypes.DATE,
            defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
        },
    },{
        tableName:'sify_darc_modules_query',
        timestamps:false,
        freezeTableName:true,
    });
   return ArchiveQuery;
};