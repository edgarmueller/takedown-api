import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const options = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, './src/db/migrations/*.{ts,js}')],
  synchronize: false,
  cli: {
    migrationsDir: join(__dirname, './src/db/migrations'),
  },
  logging: ['error'],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

export = options;
