var moment = require('moment');

var Log=(function(){
		function Log(){
			
		}
		Log.prototype.vt_tabid=null;
		Log.prototype.module_name=null;
		Log.prototype.status=null;
		Log.prototype.process_date=moment().format('YYYY-MM-DD HH:mm:ss');
		Log.prototype.insert_duration=null;
		Log.prototype.ins_rows='';
		Log.prototype.del_rows=null;
		Log.prototype.del_duration=null;
		Log.prototype.err_msg=null;
		Log.prototype.ins_st_time=null;
		Log.prototype.ins_end_time=null;
		Log.prototype.del_st_time=null;
		Log.prototype.del_end_time=null;
		Log.prototype.sel_query=null;
		Log.prototype.del_query=null;
	
	Log.prototype.save=function(db){
		try{
			var Log=db.import('../model/archive-log');
			
			var log=new Log();
			log.vt_tabid=this.vt_tabid;
			log.module_name=this.module_name;
			log.status=this.status;
			log.process_date=this.process_date;
			log.insert_duration=this.insert_duration;
			log.ins_rows=this.ins_rows;
			log.del_rows=this.del_rows;
			log.del_duration=this.del_duration;
			log.err_msg=this.err_msg;
			log.ins_st_time=this.ins_st_time;
			log.ins_end_time=this.ins_end_time;
			log.del_st_time=this.del_st_time;
			log.del_end_time=this.del_end_time;
			log.sel_query=this.del_st_time;
			log.sel_query=this.del_st_time;

			log.save().then(sr=>{
			}).catch(e=>{
				console.log(e);
			});

			
		}
		catch(e){
			console.log(e);
		}
		
	};
	
	return Log;
})();
module.exports=exports=Log;
