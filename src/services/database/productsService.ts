// filepath: /Users/henrycruzmulet/work/personal/boxQR/src/services/database/productsService.ts
import { DatabaseService } from './db';
import { Product, ProductPhoto, ProductFilter } from '../../types/product';
import { BoxesService } from './boxesService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para manejar operaciones CRUD para los productos y sus fotos
 */
export class ProductsService {
  private static instance: ProductsService;
  private dbService: DatabaseService;
  private boxesService: BoxesService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.boxesService = BoxesService.getInstance();
  }

  /**
   * Devuelve la instancia única de ProductsService (patrón Singleton)
   */
  public static getInstance(): ProductsService {
    if (!ProductsService.instance) {
      ProductsService.instance = new ProductsService();
    }
    return ProductsService.instance;
  }

  /**
   * Inicializa el servicio de productos
   */
  public async initialize(): Promise<void> {
    await this.dbService.initialize();
  }

  /**
   * Obtiene todos los productos de la base de datos
   */
  public async getAllProducts(): Promise<Product[]> {
    try {
      const db = this.dbService.getDatabase();
      const products = await db.getAllAsync<Product>('SELECT * FROM products ORDER BY updatedAt DESC');
      
      // Cargamos las fotos para cada producto
      for (const product of products) {
        product.photos = await this.getProductPhotos(product.id);
      }
      
      return products;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos de un contenedor específico
   */
  public async getProductsByBoxId(boxId: string): Promise<Product[]> {
    try {
      const db = this.dbService.getDatabase();
      const products = await db.getAllAsync<Product>(
        'SELECT * FROM products WHERE boxId = ? ORDER BY updatedAt DESC',
        [boxId]
      );
      
      // Cargamos las fotos para cada producto
      for (const product of products) {
        product.photos = await this.getProductPhotos(product.id);
      }
      
      return products;
    } catch (error) {
      console.error(`Error al obtener los productos del contenedor ${boxId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un producto por su ID
   */
  public async getProductById(id: string): Promise<Product | null> {
    try {
      const db = this.dbService.getDatabase();
      const product = await db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [id]);
      
      if (product) {
        // Cargamos las fotos del producto
        product.photos = await this.getProductPhotos(product.id);
        return product;
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Añade un nuevo producto a la base de datos
   */
  public async addProduct(product: Product): Promise<string> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      // Si el producto no tiene un ID, generamos uno nuevo
      const productId = product.id || uuidv4();
      
      await db.runAsync(
        `INSERT INTO products (id, boxId, name, description, quantity, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          product.boxId,
          product.name,
          product.description || null,
          product.quantity || 1,
          now,
          now
        ]
      );

      // Si el producto tiene fotos, las guardamos
      if (product.photos && product.photos.length > 0) {
        for (const photo of product.photos) {
          await this.addProductPhoto({
            ...photo,
            productId
          });
        }
      }

      // Actualizamos el contador de items del contenedor
      await this.updateBoxItemCount(product.boxId);
      
      return productId;
    } catch (error) {
      console.error('Error al añadir el producto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un producto existente
   */
  public async updateProduct(product: Product): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      await db.runAsync(
        `UPDATE products
         SET name = ?, description = ?, quantity = ?, updatedAt = ?
         WHERE id = ?`,
        [
          product.name,
          product.description || null,
          product.quantity || 1,
          now,
          product.id
        ]
      );

      // Si el producto tiene fotos, actualizamos las existentes o añadimos nuevas
      if (product.photos && product.photos.length > 0) {
        // Obtenemos las fotos actuales
        const currentPhotos = await this.getProductPhotos(product.id);
        const currentPhotoIds = currentPhotos.map(p => p.id);
        
        for (const photo of product.photos) {
          if (currentPhotoIds.includes(photo.id)) {
            // La foto ya existe, la actualizamos
            await this.updateProductPhoto(photo);
          } else {
            // La foto no existe, la añadimos
            await this.addProductPhoto({
              ...photo,
              productId: product.id
            });
          }
        }
        
        // Eliminamos las fotos que ya no existen en el producto actualizado
        const updatedPhotoIds = product.photos.map(p => p.id);
        for (const currentPhoto of currentPhotos) {
          if (!updatedPhotoIds.includes(currentPhoto.id)) {
            await this.deleteProductPhoto(currentPhoto.id);
          }
        }
      }
    } catch (error) {
      console.error(`Error al actualizar el producto con ID ${product.id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un producto por su ID
   */
  public async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this.getProductById(id);
      if (!product) return;

      const db = this.dbService.getDatabase();
      
      // Primero eliminamos todas las fotos asociadas al producto
      await db.runAsync('DELETE FROM product_photos WHERE productId = ?', [id]);
      
      // Luego eliminamos el producto
      await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
      
      // Actualizamos el contador de items del contenedor
      await this.updateBoxItemCount(product.boxId);
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca productos según criterios
   */
  public async searchProducts(filter: ProductFilter): Promise<Product[]> {
    try {
      const db = this.dbService.getDatabase();
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];
      
      if (filter.boxId) {
        query += ' AND boxId = ?';
        params.push(filter.boxId);
      }
      
      if (filter.query) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${filter.query}%`, `%${filter.query}%`);
      }
      
      query += ' ORDER BY updatedAt DESC';
      
      const products = await db.getAllAsync<Product>(query, params);
      
      // Cargamos las fotos para cada producto
      for (const product of products) {
        product.photos = await this.getProductPhotos(product.id);
      }
      
      return products;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las fotos de un producto
   */
  private async getProductPhotos(productId: string): Promise<ProductPhoto[]> {
    try {
      const db = this.dbService.getDatabase();
      return await db.getAllAsync<ProductPhoto>(
        'SELECT * FROM product_photos WHERE productId = ? ORDER BY isPrimary DESC, updatedAt DESC',
        [productId]
      );
    } catch (error) {
      console.error(`Error al obtener las fotos del producto ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Añade una nueva foto para un producto
   */
  public async addProductPhoto(photo: ProductPhoto): Promise<string> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      // Si la foto no tiene un ID, generamos uno nuevo
      const photoId = photo.id || uuidv4();
      
      await db.runAsync(
        `INSERT INTO product_photos (id, productId, photoUri, isPrimary, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          photoId,
          photo.productId,
          photo.photoUri,
          photo.isPrimary ? 1 : 0,
          now,
          now
        ]
      );
      
      // Si la foto es primaria, actualizamos las demás fotos del producto a no primarias
      if (photo.isPrimary) {
        await db.runAsync(
          `UPDATE product_photos SET isPrimary = 0 WHERE productId = ? AND id != ?`,
          [photo.productId, photoId]
        );
      }
      
      return photoId;
    } catch (error) {
      console.error('Error al añadir la foto del producto:', error);
      throw error;
    }
  }

  /**
   * Actualiza una foto existente
   */
  public async updateProductPhoto(photo: ProductPhoto): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      await db.runAsync(
        `UPDATE product_photos
         SET photoUri = ?, isPrimary = ?, updatedAt = ?
         WHERE id = ?`,
        [
          photo.photoUri,
          photo.isPrimary ? 1 : 0,
          now,
          photo.id
        ]
      );
      
      // Si la foto es primaria, actualizamos las demás fotos del producto a no primarias
      if (photo.isPrimary) {
        await db.runAsync(
          `UPDATE product_photos SET isPrimary = 0 WHERE productId = ? AND id != ?`,
          [photo.productId, photo.id]
        );
      }
    } catch (error) {
      console.error(`Error al actualizar la foto con ID ${photo.id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una foto por su ID
   */
  public async deleteProductPhoto(id: string): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      await db.runAsync('DELETE FROM product_photos WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Error al eliminar la foto con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el contador de items de un contenedor
   */
  private async updateBoxItemCount(boxId: string): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      
      // Contamos todos los productos asociados al contenedor
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM products WHERE boxId = ?',
        [boxId]
      );
      
      const count = result ? result.count : 0;
      
      // Actualizamos el contador de items del contenedor
      await db.runAsync(
        'UPDATE boxes SET itemCount = ?, updatedAt = ? WHERE id = ?',
        [count, Date.now(), boxId]
      );
    } catch (error) {
      console.error(`Error al actualizar el contador de items del contenedor ${boxId}:`, error);
      throw error;
    }
  }
}