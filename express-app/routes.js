const express = require("express"),
  fs = require('fs'),
  router = express.Router();

//GET home page.
router.get("/", function(req, res) {
  res.render("index", { title: "Word Image Handler" });
});

router.get("/guide", function(req, res) {
  res.render("guide", { title: "Guide" });
});

router.get("/about", function(req, res) {
  res.render("about", { title: "Word Image Handler", version: global.process.argv.slice(-1) });
});

router.get('/sayHello', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'success'
  })
})

router.post("/getImageData", function(req, res) {
  const data = req.url?req.url.split('?')[1]:""
  const url = data?data.split('=')[1]:""
  const fileUrl = url?url.replace('file:///',''):''
  if(fileUrl){
    var bData = fs.readFileSync(fileUrl);
    var base64Str = bData.toString('base64');
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
      status: 'success',
      data: base64Str
    })
  }else{
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
      status: 'error',
      mesg: 'NO FILE URL',
      imputUrl: url
    })
  }
});

router.get("/getImageData", function(req, res) {
  const data = req.url?req.url.split('?')[1]:""
  const url = data?data.split('=')[1]:""
  const fileUrl = url?url.replace('file:///',''):''
  if(fileUrl){
    var bData = fs.readFileSync(fileUrl);
    var base64Str = bData.toString('base64');
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
      status: 'success',
      data: base64Str
    })
  }else{
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
      status: 'error',
      mesg: 'NO FILE URL',
      imputUrl: url
    })
  }
});

module.exports = router;
