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
    ArchiveCtrl.prototype.doArchive= async function(){
        try{
            var ArchiveLog=this.source.import('../model/archive-log');
            var self=this;
            var queries=await this.getQueries();
            if(queries){
               return await queries.reduce(async (promise, query) => {
                    console.log(query['id'],'=>',query['vt_tabid'],'=>',query['sequence']);
                    var log=new ArchiveLog();
                    log['vt_tabid']=query['vt_tabid'];
                    log['module_name']=query['module_name'];
                    log['process_date']=moment().format('YYYY-MM-DD HH:mm:ss');
                    log['sel_query']=query['sel_query_template'];
                    log['del_query']=query['del_query_template'];
                    var count_query=await self.getCountQuery(query['sel_query_template']);
                    var {no_of_rows,error}=await self.getNoRows(count_query);
                    if(no_of_rows>0 && error==0){
                        var {error,table}=await self.getArchiveTable(query['sel_query_template']);   
                        if(error==0){
                            log['ins_st_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                            var {error,no_of_rows_inserted}= await self.insertData(table,query['sel_query_template']);
                            if(error==0 && no_of_rows_inserted>0){
                                log['ins_rows']=no_of_rows_inserted;
                                log['ins_end_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                //log['insert_duration'] = moment.duration(new moment().diff(log['ins_end_time']))
                                log['del_st_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                var {del_err,deleted_rows}=await self.deleteData(query['del_query_template']);
                                if(del_err==0){
                                    log['status']=1;
                                    log['del_end_time']=moment().format('YYYY-MM-DD HH:mm:ss');
                                    //log['del_duration'] = moment.duration(new moment().diff(log['del_end_time']))
                                    log['err_msg']="Archived successfully!";
                                    log['del_rows']=no_of_rows_inserted;
                                    log.save();
                                }
                                else{

                                }
                            }
                            else{
                                log['status']=2;
                                log['err_msg']=no_of_rows_inserted;
                                log.save(); 
                            }
                        }
                        else{
                            log['status']=2;
                            log['err_msg']=error;
                            log.save();  
                        }
                    }
                    else{
                        log['status']=2;
                        log['err_msg']=error;

                        log.save();
                    }
                    

                }, Promise.resolve());
            }
            else{
                return Promise.reject("No queries found to do archive");
            }
        }catch(e){
            return Promise.reject(e.message);
        }
    }
    ArchiveCtrl.prototype.insertData=async function(dest_table,sel_query){
        var source_database=this.source.getDatabaseName();
        var insert_query="insert into "+dest_table+" "+sel_query;
        return await this.destination.query(insert_query,{type:QueryTypes.INSERT}).then(res=>{
            return {error:0,no_of_rows_inserted:res[1]}
        }).catch(e=>{
            return {error:1,no_of_rows_inserted:e.error};
        })
    }
    ArchiveCtrl.prototype.deleteData=async function(del_query){
        return await this.source.query(del_query,{type:QueryTypes.DELETE}).then(res=>{
            return {del_err:0, deleted_rows:0}
        }).catch(e=>{
            return {del_err:1, deleted_rows:e.Error}
        });
    }
    ArchiveCtrl.prototype.getArchiveTable=async function(sel_query){
        var query_before_where=sel_query.match(/WHERE\b/i);
        var query_before_where=sel_query.slice(0,query_before_where.index+5);
        var source_table=query_before_where.match(new RegExp('FROM' + "(.*)" + 'WHERE','i'))[1].replace(/\s/g, "");
        var dest_table=source_table+'_'+process.env.FNXT_ARCHIVE_TABLE_POSTFIX;
        var dest_table_creation_query="CREATE TABLE IF NOT EXISTS "+dest_table+" LIKE "+source_table;
        return await this.destination.query(dest_table_creation_query,{type:QueryTypes.RAW}).then(res=>{
            return {error:0,table:dest_table};
        }).catch(e=>{
            return {error:1,table:e.message};
        });
    }
    ArchiveCtrl.prototype.getCountQuery=async function(sel_query){
        var regex = /SELECT \*/i;
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
        return ArchiveQuery.findAll({
            order: [
                ['module_name', 'ASC'],
                ['vt_tabid', 'ASC'],
                ['sequence', 'ASC'],
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
