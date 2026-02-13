export type lang = 'en' | 'ar';

export class LanguageManager {
  constructor() {}
  translate(key: lang, identifier: any): string | undefined {
    if (key != 'en' && key != 'ar') key = 'en';
    return identifier[key];
  }
}
