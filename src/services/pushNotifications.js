import { getApp, getApps, initializeApp } from "firebase/app"
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging"

const DEVICE_ID_KEY = "deviceId"

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }
}

function hasFirebaseConfig(config) {
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId)
}

function getFirebaseApp(config) {
  return getApps().length ? getApp() : initializeApp(config)
}

function createDeviceId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getDeviceId() {
  const existingDeviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (existingDeviceId) return existingDeviceId

  const deviceId = createDeviceId()
  localStorage.setItem(DEVICE_ID_KEY, deviceId)
  return deviceId
}

async function getServiceWorkerRegistration(config) {
  if (!("serviceWorker" in navigator)) return null

  const params = new URLSearchParams()
  Object.entries(config).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`)
}

export async function getFcmToken() {
  const config = getFirebaseConfig()
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

  if (!hasFirebaseConfig(config) || !vapidKey) return null
  if (!("Notification" in window)) return null

  const supported = await isSupported()
  if (!supported) return null

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null

  const app = getFirebaseApp(config)
  const messaging = getMessaging(app)
  const serviceWorkerRegistration = await getServiceWorkerRegistration(config)

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: serviceWorkerRegistration || undefined
  })
}

export async function listenForForegroundMessages(callback) {
  const config = getFirebaseConfig()
  if (!hasFirebaseConfig(config)) return () => {}

  const supported = await isSupported()
  if (!supported) return () => {}

  const app = getFirebaseApp(config)
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
