import { DatabaseService } from './db';
import { Box } from '../../components/boxes/BoxCard';

/**
 * Servicio para manejar operaciones CRUD para los contenedores (boxes)
 */
export class BoxesService {
  private static instance: BoxesService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Devuelve la instancia única de BoxesService (patrón Singleton)
   */
  public static getInstance(): BoxesService {
    if (!BoxesService.instance) {
      BoxesService.instance = new BoxesService();
    }
    return BoxesService.instance;
  }

  /**
   * Inicializa el servicio de contenedores
   */
  public async initialize(): Promise<void> {
    await this.dbService.initialize();
  }

  /**
   * Obtiene todos los contenedores de la base de datos
   */
  public async getAllBoxes(): Promise<Box[]> {
    try {
      const db = this.dbService.getDatabase();
      const result = await db.getAllAsync<Box>('SELECT * FROM boxes ORDER BY updatedAt DESC');
      return result;
    } catch (error) {
      console.error('Error al obtener los contenedores:', error);
      throw error;
    }
  }

  /**
   * Obtiene un contenedor por su ID
   */
  public async getBoxById(id: string): Promise<Box | null> {
    try {
      const db = this.dbService.getDatabase();
      const result = await db.getFirstAsync<Box>('SELECT * FROM boxes WHERE id = ?', [id]);
      return result || null;
    } catch (error) {
      console.error(`Error al obtener el contenedor con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Añade un nuevo contenedor a la base de datos
   */
  public async addBox(box: Box): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      await db.runAsync(
        `INSERT INTO boxes (id, name, description, location, category, itemCount, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          box.id,
          box.name,
          box.description || null,
          box.location || null,
          box.category || null,
          box.itemCount || 0,
          now,
          now
        ]
      );
    } catch (error) {
      console.error('Error al añadir el contenedor:', error);
      throw error;
    }
  }

  /**
   * Actualiza un contenedor existente
   */
  public async updateBox(box: Box): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      const now = Date.now();
      
      await db.runAsync(
        `UPDATE boxes
         SET name = ?, description = ?, location = ?, category = ?, itemCount = ?, updatedAt = ?
         WHERE id = ?`,
        [
          box.name,
          box.description || null,
          box.location || null,
          box.category || null,
          box.itemCount || 0,
          now,
          box.id
        ]
      );
    } catch (error) {
      console.error(`Error al actualizar el contenedor con ID ${box.id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un contenedor por su ID
   */
  public async deleteBox(id: string): Promise<void> {
    try {
      const db = this.dbService.getDatabase();
      await db.runAsync('DELETE FROM boxes WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Error al eliminar el contenedor con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca contenedores según criterios
   * @param query Texto a buscar en nombre, descripción, ubicación o categoría
   */
  public async searchBoxes(query: string): Promise<Box[]> {
    try {
      const db = this.dbService.getDatabase();
      const searchParam = `%${query}%`;
      
      const result = await db.getAllAsync<Box>(
        `SELECT * FROM boxes 
         WHERE name LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ?
         ORDER BY updatedAt DESC`,
        [searchParam, searchParam, searchParam, searchParam]
      );
      
      return result;
    } catch (error) {
      console.error(`Error al buscar contenedores con la consulta "${query}":`, error);
      throw error;
    }
  }

  /**
   * Filtra contenedores por categoría y/o ubicación
   * @param filters Objeto con criterios de filtrado (categoría y ubicación)
   */
  public async filterBoxes(filters: { category?: string; location?: string }): Promise<Box[]> {
    try {
      const db = this.dbService.getDatabase();
      let query = 'SELECT * FROM boxes WHERE 1=1';
      const params: any[] = [];
      
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      
      if (filters.location) {
        query += ' AND location = ?';
        params.push(filters.location);
      }
      
      query += ' ORDER BY updatedAt DESC';
      
      const result = await db.getAllAsync<Box>(query, params);
      return result;
    } catch (error) {
      console.error('Error al filtrar contenedores:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías únicas de los contenedores
   */
  public async getAllCategories(): Promise<string[]> {
    try {
      const db = this.dbService.getDatabase();
      const result = await db.getAllAsync<{category: string}>(
        'SELECT DISTINCT category FROM boxes WHERE category IS NOT NULL ORDER BY category'
      );
      return result.map(item => item.category);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las ubicaciones únicas de los contenedores
   */
  public async getAllLocations(): Promise<string[]> {
    try {
      const db = this.dbService.getDatabase();
      const result = await db.getAllAsync<{location: string}>(
        'SELECT DISTINCT location FROM boxes WHERE location IS NOT NULL ORDER BY location'
      );
      return result.map(item => item.location);
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw error;
    }
  }
}