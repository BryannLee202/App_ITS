const fs = require('fs');
const path = require('path');

const NOTIFICATIONS_FILE = path.join(__dirname, '../data/notifications.json');

function loadNotifications() {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading notifications file:', err.message);
  }
  return [];
}

function saveNotifications(data) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing notifications file:', err.message);
  }
}

exports.getNotifications = (req, res) => {
  const notifs = loadNotifications();
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return res.json({
    success: true,
    total: notifs.length,
    unreadCount,
    notifications: notifs
  });
};

exports.markAsRead = (req, res) => {
  const { id } = req.params;
  const notifs = loadNotifications();
  const target = notifs.find((n) => n.id === id);

  if (target) {
    target.isRead = true;
    saveNotifications(notifs);
  }

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  return res.json({
    success: true,
    message: 'Đã đánh dấu thông báo là đã đọc',
    unreadCount,
    notification: target
  });
};

exports.markAllAsRead = (req, res) => {
  const notifs = loadNotifications();
  notifs.forEach((n) => {
    n.isRead = true;
  });
  saveNotifications(notifs);

  return res.json({
    success: true,
    message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    unreadCount: 0,
    notifications: notifs
  });
};

exports.deleteNotification = (req, res) => {
  const { id } = req.params;
  let notifs = loadNotifications();
  const initialLength = notifs.length;
  notifs = notifs.filter((n) => n.id !== id);

  saveNotifications(notifs);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return res.json({
    success: true,
    deleted: initialLength !== notifs.length,
    message: 'Đã xóa thông báo thành công',
    unreadCount,
    total: notifs.length
  });
};

exports.clearAllNotifications = (req, res) => {
  saveNotifications([]);
  return res.json({
    success: true,
    message: 'Đã xóa toàn bộ danh sách thông báo',
    unreadCount: 0,
    total: 0,
    notifications: []
  });
};

exports.createNotification = (req, res) => {
  const { title, body, category = 'OFFERS', image, actionType = 'OFFERS', actionPayload } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Tiêu đề thông báo là bắt buộc' });
  }

  const notifs = loadNotifications();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    category,
    categoryLabel: category === 'OFFERS' ? 'Ưu đãi' : category === 'NEWS' ? 'Tin tức' : 'Hệ thống',
    title,
    body: body || '',
    timeAgo: 'Vừa xong',
    createdAt: new Date().toISOString(),
    image: image || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
    isRead: false,
    actionType,
    actionPayload
  };

  notifs.unshift(newNotif);
  saveNotifications(notifs);

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  return res.json({
    success: true,
    message: 'Đã gửi thông báo mới thành công',
    unreadCount,
    notification: newNotif
  });
};
