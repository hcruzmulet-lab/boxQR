// filepath: /Users/henrycruzmulet/work/personal/boxQR/src/types/product.ts
/**
 * Interfaces para los productos y sus fotos asociadas
 */

export interface Product {
  id: string;
  boxId: string;
  name: string;
  description?: string;
  quantity: number;
  createdAt?: number;
  updatedAt?: number;
  photos?: ProductPhoto[];
}

export interface ProductPhoto {
  id: string;
  productId: string;
  photoUri: string;
  isPrimary: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductFilter {
  boxId?: string;
  query?: string;
}