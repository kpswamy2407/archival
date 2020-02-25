require('dotenv').config({
    path:'./config/.env'
});
const Sequelize=require('sequelize');
var source=new Sequelize(process.env.FNXT_SOURCE_DB,process.env.FNXT_SOURCE_USER,process.env.FNXT_SOURCE_PWD, {
        host: process.env.FNXT_SOURCE_HOST,
        dialect: 'mysql',
        dialectOptions:{
            connectTimeout: 1000000,
        },
        timezone:'+05:30',
        logging:false,
        pool: {
            max: 15,
            min: 5,
            acquire: 150000,
            idle: 5000
        },
        port:process.env.FNXT_SOURCE_PORT,
});
    
module.exports=exports=source;
