import { API_BASE_URL } from '../config/api.config';
const API = API_BASE_URL;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function registerPush(token: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Get VAPID public key from server
    const res = await fetch(`${API}/push/vapid-key`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const { publicKey } = await res.json();

    // Check existing subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // Send subscription to server
    await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
  } catch {
    // Push setup is optional — never break the app
  }
}

export async function sendTestPush(token: string): Promise<{ sent: number; failed: number } | null> {
  try {
    const res = await fetch(`${API}/push/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return null;
  }
}
