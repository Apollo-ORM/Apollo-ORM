import { Connection, ConnectionOptions } from "apollo_core/connection";
import { afterEach, beforeEach, expect, it, describe } from "bun:test";
import { Database } from "bun:sqlite";


describe('Connection', () => {
  let connection: Connection;
  const db = new Database(":memory:");

  const connectionOptions: ConnectionOptions = {
    name: 'TestConnection',
    config: {
      client: 'sqlite3',
      connection: {
        filename: 'tests/connection/my.db3'
      },
      useNullAsDefault: true,
    },
  };

  beforeEach(() => {
    connection = new Connection(connectionOptions);
  });

  afterEach(async () => {
    await connection.disconnect();
  });

  it('should initialize correctly', () => {
    expect(connection).toBeInstanceOf(Connection);
  });

  it('should connect successfully', async () => {
    await connection.connect();
    expect(connection.ready).toEqual(true);
  });

  it('should perform a health check successfully', async () => {
    await connection.connect();
    const isHealthy = await connection.healthCheck();
    expect(isHealthy).toEqual(true);
  });

  it('should disconnect successfully', async () => {
    await connection.connect();
    await connection.disconnect();
    expect(connection.ready).toEqual(false);
  });
});
