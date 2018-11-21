var express = require('express');
var router = express.Router();

/// 图片上传 start ///
var multer  = require('multer');
var upload = multer({ dest: 'upload/' });
/// 图片上传 end///

var user_controller = require('../controllers/userController');
var upload_controller = require('../controllers/uploadController');

/* GET home page. */

/// Login Router ///
router.get('/login', user_controller.user_login_get);
router.post('/login', user_controller.user_login_post);

/// Register Router ///
router.get('/register', user_controller.user_register_get);
router.post('/register', user_controller.user_register_post);

/// Avatar Router ///
router.get('/avatar', user_controller.user_avatar_get );

// 单图上传 
router.post('/upload', upload.single('avatar'), upload_controller.upload_post);
//多图上传 
router.post('/upload_mult', upload.array('avatar', 3), upload_controller.upload_post);
//混合上传 (不同字段限制数量不同)
var cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 3 }])
router.post('/cool-profile', cpUpload, upload_controller.upload_post)

//图片列表
router.get('/gallery', user_controller.user_gallery_get)



module.exports = router;
