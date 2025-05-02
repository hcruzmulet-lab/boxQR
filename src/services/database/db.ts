import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Nombre de la base de datos
const DATABASE_NAME = 'boxqr.db';

// Versión actual de la base de datos
const DATABASE_VERSION = 1;

/**
 * Clase singleton para gestionar la conexión a la base de datos SQLite
 * y proporcionar métodos utilitarios para operaciones comunes.
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private database: SQLite.SQLiteDatabase;
  private initialized: boolean = false;

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
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
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

      // Aquí podríamos crear otras tablas para los items, usuarios, etc.
      
      this.initialized = true;
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
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