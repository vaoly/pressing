import type { ArticlePressing, ArticleSelectionne, Classe, InfoClasse } from "../types";

export const VETEMENTS: ArticlePressing[] = [
  { nom: "Robe",     prix: 2500, emoji: "" },
  { nom: "Haut",     prix: 2000, emoji: "" },
  { nom: "Jupe",     prix: 2000, emoji: "" },
  { nom: "Pantalon", prix: 2500, emoji: "" },
  { nom: "Jean",     prix: 3000, emoji: "" },
  { nom: "Veste",    prix: 3000, emoji: "" },
  { nom: "Ensemble", prix: 4000, emoji: "" },
];

export const CLASSES: Record<Classe, InfoClasse> = {
  standard: { label: "Standard", delai: 5, majoration: 0,    color: "#7c6f5e" },
  premium:  { label: "Premium",  delai: 2, majoration: 0.10, color: "#b8860b" },
  vip:      { label: "VIP",      delai: 1, majoration: 0.15, color: "#8b0000" },
};

export function calculerPrix(
  vetements: ArticleSelectionne[],
  classe: Classe
): number {
  const base = vetements.reduce(
    (sum, v) => sum + v.prix * v.quantite,
    0
  );
  const majoration = CLASSES[classe].majoration;
  return Math.round(base * (1 + majoration));
}

export function dateRetrait(dateDepot: Date, classe: Classe): Date {
  const d = new Date(dateDepot);
  d.setDate(d.getDate() + CLASSES[classe].delai);
  return d;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

export function formatPrix(prix: number): string {
  return prix.toLocaleString("fr-FR") + " FCFA";
}
