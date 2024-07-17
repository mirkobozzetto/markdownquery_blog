/**
 * Fonction pour logger des messages de développement
 */

export function logDev(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV ${new Date().toISOString()}] ${message}`, ...args);
  }
}
