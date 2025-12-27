/**
 * useVertical Hook
 *
 * Provides access to the current vertical configuration based on the
 * organization's selected use case (film, music, photo, general).
 *
 * Usage:
 * const { vertical, config, t, features, categories, roles, customFields } = useVertical();
 *
 * - t.job = "Session" (for music), "Job" (for film), etc.
 * - features.simpleLoans = true/false
 * - categories = ["Electric Guitars", "Bass Guitars", ...]
 */

import { useAppContext } from '../context/AppContext';
import {
  Vertical,
  VerticalConfig,
  getVerticalConfig,
  getCategoriesForVertical,
  getRolesForVertical,
  getCustomFieldsForVertical,
  isFeatureEnabled,
  CustomFieldDefinition,
} from '../lib/verticalConfig';

export interface UseVerticalReturn {
  /** Current vertical ID (film, music, photo, general) */
  vertical: Vertical;

  /** Full configuration object for the current vertical */
  config: VerticalConfig;

  /** Shorthand for terminology (t.job, t.checkout, etc.) */
  t: VerticalConfig['terminology'];

  /** Feature flags for current vertical */
  features: VerticalConfig['features'];

  /** Categories available in current vertical */
  categories: string[];

  /** Roles available in current vertical */
  roles: string[];

  /** Custom field definitions for inventory items */
  customFields: CustomFieldDefinition[];

  /** Check if a specific feature is enabled */
  hasFeature: (feature: keyof VerticalConfig['features']) => boolean;

  /** Get the proper label for a UI element based on terminology */
  getLabel: (key: keyof VerticalConfig['terminology']) => string;
}

export const useVertical = (): UseVerticalReturn => {
  const { state } = useAppContext();

  // Get vertical from state (defaults to 'film' for backwards compatibility)
  const vertical: Vertical = state.vertical || 'film';
  const config = getVerticalConfig(vertical);

  // Helper to check if a feature is enabled
  const hasFeature = (feature: keyof VerticalConfig['features']): boolean => {
    return isFeatureEnabled(vertical, feature);
  };

  // Helper to get terminology label
  const getLabel = (key: keyof VerticalConfig['terminology']): string => {
    return config.terminology[key];
  };

  return {
    vertical,
    config,
    t: config.terminology,
    features: config.features,
    categories: getCategoriesForVertical(vertical),
    roles: getRolesForVertical(vertical),
    customFields: getCustomFieldsForVertical(vertical),
    hasFeature,
    getLabel,
  };
};

export default useVertical;
