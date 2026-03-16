export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
