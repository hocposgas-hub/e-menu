const VAPID_PUBLIC_KEY = 'BAW5Z1W48TgYi3d1sLalJNyX-OFsxZBI8Kcu9IsxIW3d2NGPDKH9jBrmrTTd4c3muu_efKVUXpAsstTkpLdBnu4';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);

  return Uint8Array.from(
    [...rawData].map(char => char.charCodeAt(0))
  );
}

async function enableWebPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Browser ไม่รองรับ Service Worker');
  }

  if (!('PushManager' in window)) {
    throw new Error('Browser ไม่รองรับ Web Push');
  }

  if (!('Notification' in window)) {
    throw new Error('Browser ไม่รองรับ Notification');
  }

  if (!window.isSecureContext) {
    throw new Error('ต้องเปิดเว็บไซต์ผ่าน HTTPS');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('ผู้ใช้ยังไม่ได้อนุญาต Notification');
  }

  // ตัวอย่างสำหรับ GitHub Pages ที่เผยแพร่ใน /e-menu/
  const registration = await navigator.serviceWorker.register(
    '/e-menu/sw.js',
    { scope: '/e-menu/' }
  );

  await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY
      )
    });
  }

  // ส่ง subscription ไปเก็บในระบบ Backend
  // ต้องสร้าง API ฝั่ง Server สำหรับบันทึกข้อมูลนี้ก่อน
  console.log('Push subscription:', subscription.toJSON());

  return subscription.toJSON();
}
