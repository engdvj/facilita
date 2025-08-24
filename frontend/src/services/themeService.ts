import { ThemeDefinition } from '../types/theme';

export interface CustomTheme extends ThemeDefinition {
  id: string;
  isCustom: true;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

class ThemeService {
  private storageKey = 'customThemes';
  
  // Get custom themes for current user
  getCustomThemes(userId?: number): CustomTheme[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];
      
      const themes: CustomTheme[] = JSON.parse(saved);
      
      // Filter by user if userId provided
      if (userId) {
        return themes.filter(theme => theme.userId === userId);
      }
      
      return themes;
    } catch (error) {
      console.error('Error loading custom themes:', error);
      return [];
    }
  }
  
  // Save a custom theme
  saveCustomTheme(theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>, userId?: number): CustomTheme {
    const customTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true
    };
    
    const existing = this.getCustomThemes();
    const updated = [...existing, customTheme];
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      
      // Also try to sync with backend if user is logged in
      if (userId) {
        this.syncThemeWithBackend(customTheme).catch(console.error);
      }
      
      return customTheme;
    } catch (error) {
      console.error('Error saving custom theme:', error);
      throw new Error('Falha ao salvar tema personalizado');
    }
  }
  
  // Update existing custom theme
  updateCustomTheme(themeId: string, updates: Partial<CustomTheme>): CustomTheme | null {
    const existing = this.getCustomThemes();
    const themeIndex = existing.findIndex(theme => theme.id === themeId);
    
    if (themeIndex === -1) {
      console.error('Theme not found:', themeId);
      return null;
    }
    
    const updatedTheme = {
      ...existing[themeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    existing[themeIndex] = updatedTheme;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
      
      // Sync with backend
      if (updatedTheme.userId) {
        this.syncThemeWithBackend(updatedTheme).catch(console.error);
      }
      
      return updatedTheme;
    } catch (error) {
      console.error('Error updating custom theme:', error);
      throw new Error('Falha ao atualizar tema');
    }
  }
  
  // Delete custom theme
  deleteCustomTheme(themeId: string): boolean {
    const existing = this.getCustomThemes();
    const filtered = existing.filter(theme => theme.id !== themeId);
    
    if (existing.length === filtered.length) {
      return false; // Theme not found
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      // Try to delete from backend as well
      this.deleteThemeFromBackend(themeId).catch(console.error);
      
      return true;
    } catch (error) {
      console.error('Error deleting custom theme:', error);
      return false;
    }
  }
  
  // Get theme by ID (including default themes)
  getThemeById(themeId: string): CustomTheme | null {
    const customThemes = this.getCustomThemes();
    return customThemes.find(theme => theme.id === themeId) || null;
  }
  
  // Import themes from backend for logged user
  async importUserThemes(userId: number): Promise<CustomTheme[]> {
    try {
      // This would be an API call to get user's themes from backend
      const response = await fetch(`/api/users/${userId}/themes`);
      if (response.ok) {
        const themes: CustomTheme[] = await response.json();
        
        // Merge with local themes
        const localThemes = this.getCustomThemes();
        const merged = this.mergeThemes(localThemes, themes);
        
        localStorage.setItem(this.storageKey, JSON.stringify(merged));
        return themes;
      }
      return [];
    } catch (error) {
      console.error('Error importing user themes:', error);
      return [];
    }
  }
  
  // Export themes to backend
  async exportUserThemes(userId: number): Promise<boolean> {
    try {
      const userThemes = this.getCustomThemes(userId);
      
      const response = await fetch(`/api/users/${userId}/themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userThemes)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error exporting user themes:', error);
      return false;
    }
  }
  
  // Sync single theme with backend
  private async syncThemeWithBackend(theme: CustomTheme): Promise<void> {
    if (!theme.userId) return;
    
    try {
      await fetch(`/api/users/${theme.userId}/themes/${theme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(theme)
      });
    } catch (error) {
      console.error('Error syncing theme with backend:', error);
    }
  }
  
  // Delete theme from backend
  private async deleteThemeFromBackend(themeId: string): Promise<void> {
    try {
      await fetch(`/api/themes/${themeId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting theme from backend:', error);
    }
  }
  
  // Merge themes, avoiding duplicates
  private mergeThemes(local: CustomTheme[], remote: CustomTheme[]): CustomTheme[] {
    const merged = [...local];
    
    for (const remoteTheme of remote) {
      const exists = merged.find(theme => theme.id === remoteTheme.id);
      if (!exists) {
        merged.push(remoteTheme);
      } else {
        // Update if remote is newer
        const existingIndex = merged.findIndex(theme => theme.id === remoteTheme.id);
        if (new Date(remoteTheme.updatedAt) > new Date(exists.updatedAt)) {
          merged[existingIndex] = remoteTheme;
        }
      }
    }
    
    return merged;
  }
  
  // Clear all themes (for logout)
  clearUserThemes(): void {
    localStorage.removeItem(this.storageKey);
  }
  
  // Duplicate theme
  duplicateTheme(themeId: string, newName: string, userId?: number): CustomTheme | null {
    const originalTheme = this.getThemeById(themeId);
    if (!originalTheme) return null;
    
    const duplicatedTheme = {
      ...originalTheme,
      name: newName,
      description: `Cópia de ${originalTheme.name}`
    };
    
    // Remove id and timestamps to create new theme
    const { id, createdAt, updatedAt, ...themeData } = duplicatedTheme;
    
    return this.saveCustomTheme(themeData, userId);
  }
}

export const themeService = new ThemeService();
export default themeService;