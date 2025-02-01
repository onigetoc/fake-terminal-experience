// import path from 'path-browserify';

// Chemin de base simulé
// const BASE_PATH = 'C:\\Users\\LENOVO\\';
const BASE_PATH = '';

/**
 * Normalise un chemin en utilisant des forward slashes
 */
export const normalizePath = (inputPath: string): string => {
  return inputPath.replace(/\\/g, '/');
};

/**
 * Combine des segments de chemin
 */
export const joinPaths = (...paths: string[]): string => {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, '')) // Supprime les slashes au début et à la fin
    .filter(Boolean)
    .join('/');
};

/**
 * Obtient le chemin complet à partir d'un chemin relatif
 */
export const getFullPath = (relativePath: string): string => {
  console.debug('Base path:', BASE_PATH);
  console.debug('Relative path:', relativePath);

  const fullPath = joinPaths(BASE_PATH, relativePath);
  console.debug('Full path:', fullPath);

  return fullPath;
};

/**
 * Vérifie si un chemin est valide
 */
export const isValidPath = (pathToCheck: string): boolean => {
  // Vérifie si le chemin ne contient pas de caractères invalides
  const invalidChars = /[<>:"|?*]/;
  return !invalidChars.test(pathToCheck);
};