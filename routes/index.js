var express = require('express');
var router = express.Router();

var url_controller = require('../controllers/url_controller.js');

router.post('/newUrl', url_controller.monitorNewUrl);
router.get('/getUrlData/:ID', url_controller.getDataOnUrl);
router.put('/editUrl/:ID', url_controller.editUrl);
router.delete('/deleteUrl/:ID',url_controller.deleteUrl);
router.get('/getUrl', url_controller.getUrl);

module.exports = router;
