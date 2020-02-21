const Sequelize=require('sequelize');
var destination=new Sequelize(process.env.FNXT_DESTINATION_DB,process.env.FNXT_DESTINATION_USER,process.env.FNXT_DESTINATION_PWD, {
        host: process.env.FNXT_DESTINATION_HOST,
        dialect: 'mysql',
        timezone:'+05:30',
        dialectOptions:{
            connectTimeout: 60000,
            requestTimeout:100000,
        },
        logging:console.log,
        /*pool: {
            max: 15,
            min: 5,
            acquire: 70000,
            idle: 5000
        },*/
        port:process.env.FNXT_DESTINATION_PORT,
});
    
module.exports=exports=destination;
