// src/types.ts ou inserido no App.tsx
export interface IItem {
  category: string;
  name: string;
  points: number;
  id: string;
  bonusItem: boolean;
  price: string; // O preço é mantido como string no estado para lidar com o input de forma eficiente
  ratio?: number; // Pontos por Real, calculado
}
