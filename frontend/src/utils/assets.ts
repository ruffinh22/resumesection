// Utilitaires pour les chemins d'assets
export const getLogoUrl = (variant: 'full' | 'compact' = 'full'): string => {
  const filename = variant === 'compact' ? 'church-logo-compact.svg' : 'church-logo.svg';
  // En développement et production, utiliser le chemin absolu /
  return `/${filename}`;
};

export const getAssetUrl = (filename: string): string => {
  return `/${filename}`;
};
