import { Connection, ConnectionOptions } from 'apollo_core/connection';

describe('connection', () => {
  let connection: Connection;

  const connectionOptions: ConnectionOptions = {
    name: 'TestConnection',
    config: {
      client: 'sqlite3',
      connection: {
        filename: 'tests/connection/my.db3',
      },
      useNullAsDefault: true,
    },
  };

  beforeAll(() => {
    connection = new Connection(connectionOptions);
  });

  afterAll(async () => {
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
