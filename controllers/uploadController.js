let co = require('co');
let fs = require('fs');
let OSS = require('ali-oss');
let uuidv4 = require('uuid/v4');

/**
 * 我将这里的一些私密文件单独放在一个文件夹中,git提交的时候可以忽略
 * 测试时将这里注释放开,替换掉<>里的内容
 */
let client = require('../config/private.js');
client = client.client();
// let client = new OSS({
//   region: '<Your region>',
//   accessKeyId: '<Your AccessKeyId>',
//   accessKeySecret: '<Your AccessKeySecret>'
// });


// client.useBucket(bucket);
var ali_oss = {
  bucket: 'self-upload'
}

function HandleFile(fileItem) {
  this.fileItem = fileItem;
  this.fileName = '';
  this.localFile = '';
}

/**
 * res: 响应(必填)
 */
HandleFile.prototype.ossUpload = function(res) {
  var self = this;
  co(function* () {
    client.useBucket(ali_oss.bucket);
    var result = yield client.put(self.fileName, self.localFile);
    var imageSrc = result.url;

    self.localFile && fs.unlinkSync(self.localFile);
    res.end(JSON.stringify({ code: 12000, msg:'上传成功', imageUrl:imageSrc }));
  }).catch(function (err) {
    self.localFile && fs.unlinkSync(self.localFile);
    res.end(JSON.stringify({ code:13000,msg:'上传失败', error: err })); 
  });
}

/**
 * res: 响应(必填)
 * next: 错误处理(必填)
 * 给图片重命名后上传
 */
HandleFile.prototype.imgRename = function(res, next) {
  var self = this;

  var filePath = './' + this.fileItem.path;
  var _temp = this.fileItem.originalname.split('.');
  var _fileType = _temp[_temp.length - 1];
  var _lastName = '.' + _fileType;
  this.fileName = uuidv4() + _lastName;
  this.localFile = './' + this.fileName;

  fs.rename(filePath, self.fileName, (err) => {
    if(err) {return next(err);}
    self.ossUpload(res);
  })
}

exports.upload_post = function(req, res, next) {
  if(req.file) {
    new HandleFile(req.file).imgRename(res, next);
  } else if(req.files) {
    var files = req.files;
    files.forEach(function(item) {
      new HandleFile(item).imgRename(res, next);
    })
  } else if(req.body && req.body.avatar) { // ajax方式提交base64
    var avatar = req.body.avatar;

    var fileName = uuidv4() + '.png';
    var filePath = './upload/' + fileName;

    var base64Data = avatar.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');

    fs.writeFile(filePath, dataBuffer, function(err) {
      if(err) {
        res.end(JSON.stringify({code:13000,msg:'文件上传失败!'}));
      } else {
        var handle = new HandleFile();
        handle.fileName = fileName;
        handle.localFile = filePath;
        handle.ossUpload(res);
      }
    })

  } else {
    res.end();
  }

  res.end();
}
