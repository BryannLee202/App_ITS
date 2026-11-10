/**
 * SMS & Zalo OTP Service (Vietnam Standard)
 * Supports:
 * 1. SpeedSMS.vn (Popular SMS gateway in VN)
 * 2. eSMS.vn (Popular VN gateway)
 * 3. Twilio SMS
 * 4. Telegram Webhook / Push simulation fallback
 */

const https = require('https');

class SmsService {
  /**
   * Send OTP via configured provider or fallback to dynamic dispatch
   * @param {string} phone e.g. "0386726647" or "+84386726647"
   * @param {string} otp 4-digit code e.g. "4918"
   * @param {string} channel "ZALO" | "SMS" | "WHATSAPP"
   */
  static async sendOtp({ phone, otp, channel = 'ZALO' }) {
    const formattedPhone = phone.startsWith('+84')
      ? phone
      : `+84${phone.replace(/^0+/, '')}`;

    console.log(`[OTP Service] Dispatching OTP [${otp}] to [${formattedPhone}] via channel: [${channel}]`);

    let sent = false;
    let providerName = 'SIMULATED_LOCAL';

    // 1. Try SpeedSMS (Vietnam)
    if (process.env.SPEEDSMS_ACCESS_TOKEN) {
      try {
        await this.sendSpeedSMS(formattedPhone, otp);
        sent = true;
        providerName = 'SpeedSMS.vn';
      } catch (err) {
        console.warn('[SpeedSMS] Error:', err.message);
      }
    }

    // 2. Try eSMS.vn (Vietnam)
    if (!sent && process.env.ESMS_API_KEY && process.env.ESMS_SECRET_KEY) {
      try {
        await this.sendESMS(formattedPhone, otp);
        sent = true;
        providerName = 'eSMS.vn';
      } catch (err) {
        console.warn('[eSMS] Error:', err.message);
      }
    }

    // 3. Try Twilio
    if (!sent && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await this.sendTwilio(formattedPhone, otp);
        sent = true;
        providerName = 'Twilio SMS';
      } catch (err) {
        console.warn('[Twilio] Error:', err.message);
      }
    }

    // 4. Try Telegram Notification (Real Phone Notification via Telegram Bot)
    if (!sent && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        await this.sendTelegram(phone, otp, channel);
        sent = true;
        providerName = 'Telegram Phone Push';
      } catch (err) {
        console.warn('[Telegram] Error:', err.message);
      }
    }

    return {
      success: true,
      provider: providerName,
      deliveredToDevice: sent,
      phone: formattedPhone,
      otp, // passed to client for dynamic in-app real push notification simulation
      message: `Mã OTP xác thực đã được gửi tới ${phone} qua ${channel === 'ZALO' ? 'Zalo' : channel === 'WHATSAPP' ? 'WhatsApp' : 'Tin nhắn SMS'}.`
    };
  }

  static sendSpeedSMS(phone, otp) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        to: [phone],
        content: `Green SM / EcoGo: Ma xac minh OTP cua ban la ${otp}. Ma co hieu luc trong 60 giay.`,
        sms_type: 2
      });

      const options = {
        hostname: 'api.speedsms.vn',
        port: 443,
        path: '/index.php/sms/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.SPEEDSMS_ACCESS_TOKEN + ':x').toString('base64')}`
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  static sendESMS(phone, otp) {
    return new Promise((resolve, reject) => {
      const cleanPhone = phone.replace('+84', '0');
      const content = `Green SM / EcoGo: Ma xac minh OTP cua ban la ${otp}.`;
      const url = `https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${cleanPhone}&Content=${encodeURIComponent(content)}&ApiKey=${process.env.ESMS_API_KEY}&SecretKey=${process.env.ESMS_SECRET_KEY}&SmsType=2`;

      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });
  }

  static sendTwilio(phone, otp) {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Green SM / EcoGo: Ma xac minh OTP cua ban la ${otp}.`
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64')}`
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  static sendTelegram(phone, otp, channel) {
    return new Promise((resolve, reject) => {
      const text = encodeURIComponent(
        `🔔 [Green SM / EcoGo OTP]\nKênh: ${channel}\nSố ĐT: ${phone}\nMã OTP: ${otp}\nThời hạn: 60 giây.`
      );
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${text}`;

      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });
  }
}

module.exports = SmsService;

