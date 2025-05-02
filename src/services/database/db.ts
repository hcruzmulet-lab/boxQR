import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Nombre de la base de datos
const DATABASE_NAME = 'boxqr.db';

// Versión actual de la base de datos
const DATABASE_VERSION = 2; // Incrementamos la versión al agregar nuevas tablas

// Variable para indicar si estamos en modo de prueba (eliminar tablas y recrear)
const TEST_MODE = false; // Cambiado a false para mantener las tablas y datos

/**
 * Clase singleton para gestionar la conexión a la base de datos SQLite
 * y proporcionar métodos utilitarios para operaciones comunes.
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private database: SQLite.SQLiteDatabase;
  private initialized: boolean = false;
  // Variable para controlar si ya se hizo el reinicio de tablas en esta sesión
  private static tablesResetPerformed: boolean = false;

  private constructor() {
    // Creamos la instancia de la base de datos
    this.database = SQLite.openDatabaseSync('boxqr.db');
  }

  /**
   * Devuelve la instancia única de DatabaseService (patrón Singleton)
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Inicializa la base de datos creando las tablas necesarias
   * En modo TEST_MODE, elimina todas las tablas solo la primera vez que se llama en la sesión
   */
  public async initialize(): Promise<void> {
    try {
      // Solo eliminamos las tablas una vez por sesión de la aplicación
      if (TEST_MODE && !DatabaseService.tablesResetPerformed) {
        console.log('Primera inicialización en modo prueba: eliminando todas las tablas existentes...');
        await this.dropAllTables();
        DatabaseService.tablesResetPerformed = true;
        this.initialized = false;
      }
      
      if (this.initialized) return;

      // Verificar si las tablas existen
      const tableCheck = await this.database.getFirstAsync<{cnt: number}>(
        "SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='boxes'"
      );
      
      const tablesExist = tableCheck && tableCheck.cnt > 0;
      
      if (!tablesExist) {
        console.log('Tablas no encontradas. Creando estructura de la base de datos...');
      
        // Crear tabla de contenedores (boxes)
        await this.database.execAsync(`
          CREATE TABLE IF NOT EXISTS boxes (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            location TEXT,
            category TEXT,
            itemCount INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL
          )
        `);

        // Crear tabla de productos relacionados a los contenedores
        await this.database.execAsync(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY NOT NULL,
            boxId TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            FOREIGN KEY (boxId) REFERENCES boxes(id) ON DELETE CASCADE
          )
        `);

        // Crear tabla para las fotos de los productos
        await this.database.execAsync(`
          CREATE TABLE IF NOT EXISTS product_photos (
            id TEXT PRIMARY KEY NOT NULL,
            productId TEXT NOT NULL,
            photoUri TEXT NOT NULL,
            isPrimary INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
          )
        `);
        
        console.log('Tablas creadas correctamente');
      } else {
        console.log('Tablas existentes detectadas, omitiendo creación');
      }
      
      this.initialized = true;
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      throw error;
    }
  }

  /**
   * Elimina todas las tablas de la base de datos
   * Útil para pruebas y reiniciar la estructura
   */
  private async dropAllTables(): Promise<void> {
    try {
      // Desactivar restricciones de claves foráneas para poder eliminar tablas en cualquier orden
      await this.database.execAsync('PRAGMA foreign_keys = OFF;');
      
      // Obtener todas las tablas existentes
      const result = await this.database.getAllAsync<{name: string}>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      // Eliminar cada tabla
      for (const table of result) {
        await this.database.execAsync(`DROP TABLE IF EXISTS ${table.name}`);
        console.log(`Tabla eliminada: ${table.name}`);
      }
      
      // Volver a activar restricciones de claves foráneas
      await this.database.execAsync('PRAGMA foreign_keys = ON;');
      
      console.log('Todas las tablas han sido eliminadas');
    } catch (error) {
      console.error('Error al eliminar las tablas:', error);
      throw error;
    }
  }

  /**
   * Retorna la instancia de la base de datos SQLite
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    return this.database;
  }

  /**
   * Cierra la conexión de la base de datos cuando la app se cierre
   * (esto es más un método preventivo, ya que SQLite maneja 
   * automáticamente la conexión en React Native)
   */
  public closeConnection(): void {
    // En SQLite de Expo, no es necesario cerrar explícitamente la conexión
    // pero mantenemos el método por consistencia y posibles cambios futuros
    console.log('Conexión a la base de datos cerrada');
  }
}

// Exportamos una instancia de la base de datos para usar en la aplicación
export const dbService = DatabaseService.getInstance();