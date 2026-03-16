export const appConfig = {
  name: 'POS System',
  version: '1.0.0',
  defaultLanguage: 'th',
  supportedLanguages: ['en', 'th', 'lo'] as const,
  defaultPageSize: 20,
  maxPageSize: 100,
  tokenKey: 'pos-auth',
  langKey: 'pos-lang',
}
