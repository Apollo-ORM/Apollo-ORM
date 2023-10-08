import {Knex , knex as KnexType} from 'knex';
import { EventEmitter } from 'events';

export interface ConnectionOptions {
  name: string;
  config: Knex.Config;
  // driver: Knex.Config
}

export class Connection extends EventEmitter {
  private connection?: Knex;
  private isConnected: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private name: string; 

  constructor({ name, config}: ConnectionOptions) {
    super();
    this.name = name; 
    this.initialize(config);
  }

  private initialize(config: Knex.Config) {
    this.connection = KnexType(config);
  }

  /**
   * Opens the database connection and starts a health check interval.
   */
  public async connect(): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('Connection is not properly initialized');
      }

      
      await this.healthCheck();

      // Start a health check interval (e.g., every 30 seconds)
      this.healthCheckInterval = setInterval(() => this.healthCheck(), 30000);

      this.isConnected = true;

      this.emit('connect', this);
    } catch (error) {
      this.emit('error', error, this);
      throw error;
    }
  }

  /**
   * Closes the database connection and stops the health check interval.
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      if (this.connection) {
        await this.connection.destroy();
        this.isConnected = false;
      }

      this.emit('disconnect', this);
    } catch (error) {
      this.emit('disconnect:error', error, this);
    }
  }

  /**
   * Returns a boolean indicating if the connection is ready.
   */
  public get ready(): boolean {
    return this.isConnected;
  }

  /**
   * Executes a health check query to verify the database connection.
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection) {
        throw new Error('Connection is not properly initialized');
      }

      const result = await this.connection.raw('SELECT 1');

      const isHealthy = result?.[0]?.[0] === 1;

      this.emit('healthcheck', isHealthy);

      return isHealthy;
    } catch (error) {
      this.emit('healthcheck:error', error);

      return false;
    }
  }
}
