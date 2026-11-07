/**
 * Cadre commun à la barre du haut et aux pages de l'espace connecté : colonne principale de
 * 640 px, plus la colonne de droite (24 px d'écart + 340 px) à partir de 1280 px de large.
 * La recherche s'aligne ainsi sur le fil, les icônes et le menu du compte sur la colonne de droite.
 */
export const PAGE_FRAME = "mx-auto w-full max-w-[640px] min-[1280px]:max-w-[1004px]";

/** Largeur de la colonne de droite et de son écart, retirée à la recherche à partir de 1280 px. */
export const SIDE_COLUMN = "min-[1280px]:grid-cols-[minmax(0,1fr)_340px] min-[1280px]:gap-6";
export const MAIN_COLUMN_ONLY = "min-[1280px]:max-w-[calc(100%-364px)]";

/** Marges latérales autour du cadre (sous 640 px, chaque élément garde les siennes). */
export const PAGE_GUTTER = "tablet:px-4 desktop:px-5";
