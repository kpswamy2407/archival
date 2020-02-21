const Sequelize=require('sequelize');
var source=new Sequelize(process.env.FNXT_SOURCE_DB,process.env.FNXT_SOURCE_USER,process.env.FNXT_SOURCE_PWD, {
        host: process.env.FNXT_SOURCE_HOST,
        dialect: 'mysql',
        dialectOptions:{
            connectTimeout: 60000,
            requestTimeout:100000,
        },
        timezone:'+05:30',
        logging:console.log,
        /*pool: {
            max: 15,
            min: 5,
            acquire: 70000,
            idle: 5000
        },*/
        port:process.env.FNXT_SOURCE_PORT,
});
    
module.exports=exports=source;
