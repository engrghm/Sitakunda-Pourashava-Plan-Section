/**
 * Sitakunda Pourashava Language Management (Bangla & English)
 */

export type PortalLanguage = 'bn' | 'en';

const LANG_KEY = 'portal_selected_lang';

export function getPortalLanguage(): PortalLanguage {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'bn') return saved;
    }
  } catch {}
  return 'bn';
}

export function setPortalLanguage(lang: PortalLanguage): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
    const domain = window.location.hostname;

    if (lang === 'en') {
      document.cookie = `googtrans=/bn/en; path=/; domain=${domain}`;
      document.cookie = 'googtrans=/bn/en; path=/';
    } else {
      document.cookie = `googtrans=/bn/bn; path=/; domain=${domain}`;
      document.cookie = 'googtrans=/bn/bn; path=/';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('portal-language-changed', { detail: { lang } }));

    // Reload to apply translation
    window.location.reload();
  } catch (err) {
    console.warn('[Language Switcher] Error setting language:', err);
  }
}
