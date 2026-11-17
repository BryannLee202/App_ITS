const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getNotifications);
router.post('/read-all', notificationController.markAllAsRead);
router.post('/read/:id', notificationController.markAsRead);
router.delete('/clear-all', notificationController.clearAllNotifications);
router.delete('/:id', notificationController.deleteNotification);
router.post('/create', notificationController.createNotification);

module.exports = router;
