import { Connection, ConnectionOptions } from 'apollo_core/connection';

describe('connection', () => {
  let connection: Connection;

  const connectionOptions: ConnectionOptions = {
    name: 'TestConnection',
    config: {
      client: 'mysql',
      connection: {
        host: 'mysql',
        port: 3306,
        userName: 'user',
        database: 'database',
        password: 'password'

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


  it('should disconnect successfully', async () => {
    await connection.connect();
    await connection.disconnect();
    expect(connection.ready).toEqual(false);
  });
});
