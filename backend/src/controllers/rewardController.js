const fs = require('fs');
const path = require('path');

const REWARDS_FILE = path.join(__dirname, '../data/rewards.json');

const REWARD_TIERS = [
  { day: 1, label: 'Thứ 2', coins: 15, voucher: null, title: 'Khởi động xanh', reward: '+15 Xu' },
  { day: 2, label: 'Thứ 3', coins: 20, voucher: null, title: 'Thói quen xanh', reward: '+20 Xu' },
  { day: 3, label: 'Thứ 4', coins: 25, voucher: 'ECOGO20', title: 'Cột mốc 3 ngày', reward: 'Voucher 20%' },
  { day: 4, label: 'Thứ 5', coins: 30, voucher: 'PRIME50K', title: 'Đặc quyền Prime', reward: '+30 Xu & 50K' },
  { day: 5, label: 'Thứ 6', coins: 40, voucher: null, title: 'Bứt phá xanh', reward: '+50 Xu' },
  { day: 6, label: 'Thứ 7', coins: 50, voucher: 'FREESHIP', title: 'Chuẩn bị cuối tuần', reward: 'Free Ship' },
  { day: 7, label: 'CN', coins: 100, voucher: 'CUOITUAN200', title: 'Đại Tiệc Xanh', isGrand: true, reward: '🎁 100K' }
];

function getTodayVN() {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().split('T')[0];
}

function getDaysDiff(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function loadRewardsData() {
  try {
    if (fs.existsSync(REWARDS_FILE)) {
      return JSON.parse(fs.readFileSync(REWARDS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading rewards file:', err.message);
  }
  return {};
}

function saveRewardsData(data) {
  try {
    fs.writeFileSync(REWARDS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing rewards file:', err.message);
  }
}

function getUserRecord(userId = 'user-001') {
  const allData = loadRewardsData();
  if (!allData[userId]) {
    allData[userId] = {
      userId,
      userName: 'Minh Tài',
      ecoCoins: 180,
      currentStreak: 0,
      lastCheckInDate: null,
      lastCheckInTimestamp: null,
      totalCheckIns: 0,
      vouchers: ['BANMOI30'],
      history: []
    };
    saveRewardsData(allData);
  }
  return { allData, user: allData[userId] };
}

exports.getCheckInStatus = (req, res) => {
  const userId = req.query.userId || 'user-001';
  const { user } = getUserRecord(userId);
  const today = getTodayVN();

  const diffDays = getDaysDiff(user.lastCheckInDate, today);
  const checkedInToday = user.lastCheckInDate === today;

  // Streak calculation: if missed more than 1 day and not yet checked in today, effective streak to display
  let effectiveStreak = user.currentStreak;
  let streakBroken = false;
  if (!checkedInToday && diffDays > 1 && user.currentStreak > 0) {
    effectiveStreak = 0;
    streakBroken = true;
  }

  // Active target day: if checked in today, target was currentStreak; if not yet checked in, target is next day
  const targetDay = checkedInToday
    ? user.currentStreak
    : (effectiveStreak >= 7 ? 1 : effectiveStreak + 1);

  const cycleDays = REWARD_TIERS.map((tier) => {
    const isDone = tier.day <= (checkedInToday ? user.currentStreak : effectiveStreak);
    const isToday = tier.day === targetDay;
    return {
      ...tier,
      done: isDone,
      isToday,
      current: isToday && !checkedInToday
    };
  });

  const nextRewardTier = REWARD_TIERS.find((t) => t.day === targetDay) || REWARD_TIERS[0];

  res.json({
    success: true,
    userId: user.userId,
    userName: user.userName,
    ecoCoins: user.ecoCoins,
    currentStreak: effectiveStreak,
    checkedInToday,
    canCheckInToday: !checkedInToday,
    streakBroken,
    today,
    lastCheckInDate: user.lastCheckInDate,
    cycleDays,
    nextReward: nextRewardTier,
    vouchers: user.vouchers
  });
};

exports.executeCheckIn = (req, res) => {
  const { userId = 'user-001' } = req.body;
  const { allData, user } = getUserRecord(userId);
  const today = getTodayVN();

  // 1. Chống spam: Kiểm tra xem hôm nay đã điểm danh chưa
  if (user.lastCheckInDate === today) {
    return res.status(400).json({
      success: false,
      code: 'ALREADY_CHECKED_IN',
      message: 'Hôm nay bạn đã điểm danh rồi! Hãy quay lại vào ngày mai để tiếp tục chuỗi quà nhé.',
      currentStreak: user.currentStreak,
      ecoCoins: user.ecoCoins
    });
  }

  // 2. Tính toán chuỗi liên tiếp (Streak Engine)
  const diffDays = getDaysDiff(user.lastCheckInDate, today);
  let nextStreak = 1;
  let isReset = false;
  let isCycleCompleted = false;

  if (diffDays === 1) {
    // Điểm danh ngày hôm sau liên tiếp
    if (user.currentStreak >= 7) {
      // Đã xong chu kỳ 7 ngày -> Reset về ngày 1 chu kỳ mới
      nextStreak = 1;
      isCycleCompleted = true;
    } else {
      nextStreak = user.currentStreak + 1;
    }
  } else if (!user.lastCheckInDate) {
    // Lần đầu điểm danh
    nextStreak = 1;
  } else {
    // Quên điểm danh >= 2 ngày -> Bị đứt chuỗi, reset lại từ ngày 1
    nextStreak = 1;
    isReset = true;
  }

  // 3. Cấp phát phần thưởng
  const rewardTier = REWARD_TIERS.find((t) => t.day === nextStreak) || REWARD_TIERS[0];
  user.ecoCoins = (user.ecoCoins || 0) + rewardTier.coins;

  let newVoucherUnlocked = null;
  if (rewardTier.voucher) {
    if (!user.vouchers) user.vouchers = [];
    if (!user.vouchers.includes(rewardTier.voucher)) {
      user.vouchers.push(rewardTier.voucher);
      newVoucherUnlocked = rewardTier.voucher;
    }
  }

  // 4. Lưu lại lịch sử và ngày điểm danh
  user.currentStreak = nextStreak;
  user.lastCheckInDate = today;
  user.lastCheckInTimestamp = new Date().toISOString();
  user.totalCheckIns = (user.totalCheckIns || 0) + 1;
  if (!user.history) user.history = [];
  user.history.push({
    date: today,
    day: nextStreak,
    coins: rewardTier.coins,
    voucher: rewardTier.voucher,
    timestamp: new Date().toISOString()
  });

  saveRewardsData(allData);

  // 5. Chuẩn bị danh sách cycleDays cập nhật
  const cycleDays = REWARD_TIERS.map((tier) => ({
    ...tier,
    done: tier.day <= nextStreak,
    isToday: tier.day === nextStreak,
    current: false
  }));

  let message = `Chúc mừng bạn đã điểm danh Ngày ${nextStreak}! Nhận ngay +${rewardTier.coins} Xu Eco`;
  if (newVoucherUnlocked) {
    message += ` & Mở khóa Voucher ${newVoucherUnlocked}!`;
  }
  if (isReset) {
    message = `Chuỗi điểm danh đã bắt đầu lại từ Ngày 1 (do bỏ lỡ hôm qua). Nhận ngay +${rewardTier.coins} Xu Eco!`;
  }
  if (isCycleCompleted) {
    message = `🎉 Tuyệt vời! Bạn đã hoàn thành chu kỳ 7 ngày và bắt đầu chu kỳ mới với +${rewardTier.coins} Xu Eco!`;
  }

  return res.json({
    success: true,
    message,
    reward: {
      day: nextStreak,
      coins: rewardTier.coins,
      voucher: newVoucherUnlocked,
      title: rewardTier.title
    },
    user: {
      userId: user.userId,
      ecoCoins: user.ecoCoins,
      currentStreak: user.currentStreak,
      lastCheckInDate: user.lastCheckInDate,
      vouchers: user.vouchers
    },
    cycleDays
  });
};
