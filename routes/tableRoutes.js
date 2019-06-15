const express = require('express');
const router = express.Router();

const TableCtrl = require('../controllers/tables');
const authHelper = require('../helpers/authHelper');

router.get('/table/get-tables', authHelper.VerifyToken, TableCtrl.getAllTables);
router.post('/table/add-table', authHelper.VerifyToken, TableCtrl.addTable);
router.post(
  '/table/delete-table',
  authHelper.VerifyToken,
  TableCtrl.deletePositionTable
);
router.post(
  '/table/edit-tables',
  authHelper.VerifyToken,
  TableCtrl.editPositionTable
);

module.exports = router;
