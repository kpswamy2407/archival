require('dotenv').config({
    path:'./config/.env'
});
const Log=require('../helper/log');
var moment = require('moment');
const { QueryTypes } = require('sequelize');

var ArchiveCtrl=(function(){
    function ArchiveCtrl(source,destination){
        Object.defineProperty(this,'source',{
            value:source,
            configurable:false,
            writable:false,
            enumerable:true,
        });
        Object.defineProperty(this,'destination',{
            value:destination,
            configurable:false,
            writable:false,
            enumerable:true,
        });
    }
    ArchiveCtrl.prototype.sleep=async function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }
   ArchiveCtrl.prototype.asyncForEach = async (array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    ArchiveCtrl.prototype.doArchive= async function(){
        try{
            var ArchiveLog=this.source.import('../model/archive-log');
            var self=this;
            var queries=await this.getQueries();
           
            if(queries){
                const start = async () => {
                  await self.asyncForEach(queries, async (query) => {
                   //await self.sleep(100);
                    var log=new ArchiveLog();
                    log['vt_tabid']=query['vt_tabid'];
                    log['module_name']=query['module_name'];
                    log['process_date']=moment().format('YYYY-MM-DD HH:mm:ss');
                    log['sel_query']=query['sel_query_template'];
                    log['del_query']=query['del_query_template'];
                    var count_query=self.getCountQuery(query['sel_query_template']);
                   
                    var {no_of_rows,error}=await self.getNoRows(count_query);
                    
                    if(no_of_rows>0 && error==0){
                        var {error,table}=await self.getArchiveTable(query['sel_query_template']);   
                        
                        if(error==0){
                            log['ins_st_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                            var insert_st_time=moment();
                            var {error,no_of_rows_inserted}= await self.insertData(table,query['sel_query_template']);
                            console.log(query['module_name'],'=> Insert =>',no_of_rows_inserted);
                            if(error==0){
                                log['ins_rows']=no_of_rows_inserted;
                                log['ins_end_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                var insert_end_time=moment();
                                log['insert_duration'] = insert_end_time.diff(insert_st_time,'seconds',true);
                                log['del_st_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                  var delete_st_time=moment();
                                var {del_err,deleted_rows}=await self.deleteData(query['del_query_template']);
                                if(del_err==0){
                                    log['status']=1;
                                    log['del_end_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                    var delete_end_time=moment();
                                    log['del_duration'] = delete_end_time.diff(delete_st_time,'seconds',true);
                                    log['err_msg']="Archived successfully!";
                                    log['del_rows']=no_of_rows_inserted;
                                    await log.save();
                                }
                                else{
                                  log['status']=2;
                                  log['err_msg']=deleted_rows;
                                  await log.save(); 
                                }
                            
                            
                        }
                            else{
                                log['status']=2;
                                log['err_msg']=no_of_rows_inserted;
                                await log.save(); 
                            }
                        }
                        else{
                            log['status']=2;
                            log['err_msg']=error;
                            await log.save();  
                        }
                    }
                    else{
                        log['status']=2;
                        log['err_msg']=error;

                       await log.save();
                    }
                    //await self.sleep(100);
                    
                  })
                  console.log('Done')
                }
                await start();
               
               return Promise.resolve("Data archived, Please check log for complete details");
                
            }
            else{
                return Promise.reject("No queries found to do archive");
            }
        }catch(e){
           
            return Promise.reject(e.message);
        }
    }
    ArchiveCtrl.prototype.insertData=async function(dest_table,sel_query){
        var self=this;
        var source_database=this.source.getDatabaseName();
        if(process.env.FNXT_DESTINATION_DB==process.env.FNXT_SOURCE_DB){
            var insert_query="insert into "+dest_table+" "+sel_query;
            return await this.destination.query(insert_query,{type:QueryTypes.INSERT}).then(res=>{
               
                return {error:0,no_of_rows_inserted:res[1]}
            }).catch(e=>{
                
                return {error:1,no_of_rows_inserted:e.message};
            })
        }
        else{

            var insert_query="insert into "+process.env.FNXT_DESTINATION_DB+'.'+dest_table+" "+sel_query;
            return await this.source.query(insert_query,{type:QueryTypes.INSERT}).then(res=>{
               
                return {error:0,no_of_rows_inserted:res[1]}
            }).catch(e=>{
                
                return {error:1,no_of_rows_inserted:e.message};
            });

        /*
            
            
            var {error,selectResults}=await self.getSelQueryResult(sel_query);
            if(error==1){
                return {error:1,no_of_rows_inserted:selectResults};
            }
            else{
               console.log(selectResults.length);
            var noI=0;
            const prepare_insert = async () => {

                
                await self.asyncForEach(selectResults, async (result) => {
                      var values=[];
                    const do_insert=async()=>{
                       
                        await self.asyncForEach(result,async(res)=>{
                            values.push(Object.values(res));
                        });
                        console.log('do insert done');
                    }
                    await do_insert();
                    //console.log(`INSERT INTO ${dest_table} VALUES ${values.map(a => '(?)').join(',')};`);
                    await self.destination.query(`INSERT INTO ${dest_table} VALUES ${values.map(a => '(?)').join(',')};`,{type:QueryTypes.INSERT, replacements:values}).then(res=>{
                           console.log(res);
                           noI=noI+res[1];
                       }).catch(e=>{
                          console.log(e);
                       })
                    delete values;
                    
                })
              console.log('prepare Done')
            }
            await prepare_insert();
            delete selectResults;
            return Promise.resolve({error:0,no_of_rows_inserted:noI}); 
            }
            
                
        */}
        
        
    }
    ArchiveCtrl.prototype.getSelQueryResult=async function(sel_query){
        var self=this;
        return await this.source.query(sel_query,{type:QueryTypes.SELECT}).then(res=>{
            const selectResults = [];
              let copied = [...res]; // ES6 destructuring
              const numOfChild = Math.ceil(copied.length / 10000); // Round up to the nearest integer
              for (let i = 0; i < numOfChild; i++) {
                selectResults.push(copied.splice(0, 10000));
              }
              return {error:0,selectResults:selectResults};
        }).catch(e=>{
            console.log(e)
            return {error:1,selectResults:e.message};
        })
    }
    ArchiveCtrl.prototype.deleteData=async function(del_query){
        var self=this;
        if(del_query.length>0 && del_query!=''){
           return await this.source.query(del_query,{type:QueryTypes.DELETE}).then(res=>{
            return {del_err:0, deleted_rows:0}
            }).catch(e=>{
            return {del_err:1, deleted_rows:e.message}
            }); 
        }
        else{
            return {del_err:0, deleted_rows:0}
        }
        
    }
    ArchiveCtrl.prototype.getArchiveTable=async function(sel_query){
        var query_before_where=sel_query.match(/WHERE\b/i);
        var query_before_where=sel_query.slice(0,query_before_where.index+5);
        var destMatch=query_before_where.match(new RegExp('FROM' + "(.*)" + ' WHERE','i'));
        if(destMatch==null){
             var source_table=query_before_where.match(new RegExp('FROM' + "(.*)" ,'i'))[1].replace(/\s/g, "");    
        }
        else{
            var source_table=query_before_where.match(new RegExp('FROM' + "(.*)" + 'WHERE','i'))[1].replace(/\s/g, "");
        }
        
        var dest_table=source_table+process.env.FNXT_ARCHIVE_TABLE_POSTFIX;
        if(process.env.FNXT_DESTINATION_DB==process.env.FNXT_SOURCE_DB){
            var dest_table_creation_query="CREATE TABLE IF NOT EXISTS "+dest_table+" LIKE "+source_table;
            
        }
        else{
        var dest_table_creation_query="CREATE TABLE IF NOT EXISTS "+dest_table+" LIKE "+ process.env.FNXT_SOURCE_DB+"."+source_table;

        }
        return await this.destination.query(dest_table_creation_query,{type:QueryTypes.RAW}).then(res=>{
            return {error:0,table:dest_table};
        }).catch(e=>{
            console.log(e);
            return {error:1,table:e.message};
        });
    }
    ArchiveCtrl.prototype.getCountQuery= function(sel_query){
        var regex = /SELECT \s?(.*?)\*/i;
        
        return sel_query.replace(regex,'SELECT count(1) as no_of_rows');
    }

    ArchiveCtrl.prototype.getNoRows=async function(count_query){

        return await this.source.query(count_query,{ type: QueryTypes.SELECT }).spread(result=>{
                        if(result.no_of_rows>0){
                            return {no_of_rows:result.no_of_rows,error:0};
                        }
                        else{
                            return {no_of_rows:0,error:"No data avaiable for the query"}
                        }
                    }).catch(e=>{
                        return {no_of_rows:0,error:e.message}
                    });
    }
    ArchiveCtrl.prototype.getQueries=async function(){
        var ArchiveQuery=this.source.import('../model/archive-query');
        return await ArchiveQuery.findAll({
            order: [
                ['module_name', 'ASC'],
                ['sequence', 'DESC'],
            ],
        }).then(queries=>{
            if(queries){
                return queries;
            }
            else{
                return false;
            }
        }).catch(e=>{
            
            return false;
        });
    }

    return ArchiveCtrl;
})();
module.exports=exports=ArchiveCtrl;
