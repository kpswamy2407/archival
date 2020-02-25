
var source=require('./config/source');
var destination=require('./config/destination');
var ArchiveCtrl=require('./controller/archive-ctrl');

(()=>{
try{
var archiveCtrl=new ArchiveCtrl(source,destination);
  	archiveCtrl.doArchive().then(out=>{
  		console.log('hello out',out);
  	}).catch(e=>{
  		console.log('test hello=>',e);
  	});
}
catch(e){
	console.log('test=>',e);
}
})();