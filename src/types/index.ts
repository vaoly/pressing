
export type StatutVetement = "en attente" | "en lavage" | "lavé";


export type Classe = "standard" | "premium" | "vip";


export interface VetementCommande {
  nom: string;
  emoji: string;
  prix: number;
  quantite: number;
  image: string | null;
  statut: StatutVetement;
}


export interface Commande {
  id: string;
  clientId: string;
  classe: Classe;
  dateDepot: string;
  dateRetrait: string;
  vetements: VetementCommande[];
  total: number;
}


export interface Client {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}


export interface DB {
  clients: Client[];
  commandes: Commande[];
}


export interface ClientFormData {
  nom: string;
  adresse: string;
  telephone: string;
}


export interface ArticlePressing {
  nom: string;
  prix: number;
  emoji: string;
}


export interface ArticleSelectionne extends ArticlePressing {
  quantite: number;
  image: string | null;
  imagePreview: string | null;
}


export interface InfoClasse {
  label: string;
  delai: number;
  majoration: number;
  color: string;
}
