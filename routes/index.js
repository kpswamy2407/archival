var express = require('express');
var router = express.Router();
var ArchiveCtrl=require('./../controller/archive-ctrl');
var source=require('./../config/source');
var destination=require('./../config/destination');

/* GET home page. */
router.get('/archive', async function(req, res, next) {
  try{
  	var app=req.app;
  	const source=app.get('source');
  	const destination=app.get('destination');
  	var archiveCtrl=new ArchiveCtrl(source,destination);
  	archiveCtrl.doArchive().then(out=>{
  		return res.json({
  			status:200,
  			messege:'Data achival process completed, Please check the log for complete status',
  		})
  	}).catch(e=>{
  		return res.json({
  			status:201,
  			messege:e,
  		})
  	});
  }
  catch(e){
  	return res.json({
  		status:201,
  		messege:e,
  	})
  }
});

module.exports = router;
