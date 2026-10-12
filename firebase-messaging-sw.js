/* =====================================================
   MCH-EMenu POS - Firebase Messaging Service Worker
   Hosting: GitHub Pages
   Path: /e-menu/firebase-messaging-sw.js
===================================================== */

// 1. โหลด Firebase SDK สำหรับ Service Worker
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

// 2. ตั้งค่า Firebase
// นำค่าจาก Firebase Console > Project settings > General
// > Your apps > SDK setup and configuration
firebase.initializeApp({
  apiKey: 'AIzaSyDIhh5w4vXe51If94-BXdSsjxVcIwY1qkU',
  authDomain: 'fcm-push-notification-hoc-pos.firebaseapp.com',
  projectId: 'fcm-push-notification-hoc-pos',
  storageBucket: 'fcm-push-notification-hoc-pos.firebasestorage.app',
  messagingSenderId: '461555325582',
  appId: '1:461555325582:web:f8dcc379d84d34b1f487df'
});

// 3. เริ่มต้น Firebase Messaging
const messaging = firebase.messaging();

// 4. รับ Notification ขณะเว็บอยู่เบื้องหลัง
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload);
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title =

    notification.title ||
    data.title ||
    'MCH-EMenu POS';

  const options = {
    body:
      notification.body ||
      data.body ||
      'มีรายการใหม่ กรุณาตรวจสอบระบบ POS',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.notificationId || data.orderId || 'mch-pos-notification',
    data: {
      url: data.url || '/e-menu/?page=staff',
      orderId: data.orderId || '',
      notificationId: data.notificationId || ''
    }
  };

  // ป้องกันการแสดงซ้ำในกรณีที่ข้อความมี notification payload
  // ให้ Backend ส่ง data-only payload สำหรับการใช้ Handler นี้
  return self.registration.showNotification(title, options);

});

// 5. เมื่อพนักงานคลิก Notification

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || '/e-menu/?page=staff',
    self.location.origin
  );

  // ไม่อนุญาตให้ Notification เปิดเว็บไซต์ภายนอก
  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {

      // ถ้ามีหน้าเว็บเดิมอยู่แล้ว ให้เปิดหน้านั้น
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient && 'navigate' in focusedClient) {
              return focusedClient.navigate(targetUrl.href);
            }
            return focusedClient;
          });
        }
      }
      // ถ้ายังไม่มีหน้าเว็บ ให้เปิดหน้า POS
      return clients.openWindow(targetUrl.href);
    })
  );
});
