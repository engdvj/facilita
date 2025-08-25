export { midnightTheme } from './midnight';
export { oceanTheme } from './ocean';
export { emeraldTheme } from './emerald';
export { forestTheme } from './forest';
export { sunsetTheme } from './sunset';
export { lavenderTheme } from './lavender';
export { auroraTheme } from './aurora';
export { sakuraTheme } from './sakura';
export { cosmicTheme } from './cosmic';
export { rubyTheme } from './ruby';

import { ThemeDefinition, ThemeId } from '../base';
import { midnightTheme } from './midnight';
import { oceanTheme } from './ocean';
import { emeraldTheme } from './emerald';
import { forestTheme } from './forest';
import { sunsetTheme } from './sunset';
import { lavenderTheme } from './lavender';
import { auroraTheme } from './aurora';
import { sakuraTheme } from './sakura';
import { cosmicTheme } from './cosmic';
import { rubyTheme } from './ruby';

// Default themes registry
export const DEFAULT_THEMES: Record<ThemeId, ThemeDefinition> = {
  midnight: midnightTheme,
  ocean: oceanTheme,
  emerald: emeraldTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  lavender: lavenderTheme,
  aurora: auroraTheme,
  sakura: sakuraTheme,
  cosmic: cosmicTheme,
  ruby: rubyTheme
};