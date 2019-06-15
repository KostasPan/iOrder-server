const express = require('express');
const router = express.Router();

const UserCtrl = require('../controllers/users');
const authHelper = require('../helpers/authHelper');

router.get('/users/get-users', authHelper.VerifyToken, UserCtrl.getUsers);
router.post('/users/delete-user', authHelper.VerifyToken, UserCtrl.deleteUser);
router.post('/users/set-user', authHelper.VerifyToken, UserCtrl.setUser);

module.exports = router;
