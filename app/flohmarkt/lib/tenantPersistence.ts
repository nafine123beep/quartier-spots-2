const STORAGE_KEY = 'quartierspot_last_selected_tenant';

interface TenantPersistence {
  userId: string;
  lastSelectedSlug: string;
  timestamp: string;
}

export function setLastSelectedTenantSlug(userId: string, slug: string): void {
  try {
    const data: TenantPersistence = {
      userId,
      lastSelectedSlug: slug,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save tenant preference to localStorage:', error);
  }
}

export function getLastSelectedTenantSlug(userId: string): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: TenantPersistence = JSON.parse(stored);

    // Only return if for same user
    if (data.userId !== userId) return null;

    return data.lastSelectedSlug;
  } catch (error) {
    console.warn('Failed to load tenant preference from localStorage:', error);
    return null;
  }
}

export function clearLastSelectedTenant(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear tenant preference:', error);
  }
}
