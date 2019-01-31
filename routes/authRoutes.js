const express = require('express');
const router = express.Router();

const AuthCtrl = require('../controllers/auth');

router.post('/login', AuthCtrl.loginUser);
router.post('/register', AuthCtrl.createUser);

module.exports = router;
