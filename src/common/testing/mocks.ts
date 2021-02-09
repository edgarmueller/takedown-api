import { Repository } from 'typeorm';

export type RepositoryLike<T> = Partial<Repository<T>>;

export const createRepositoryMock = <T>(): RepositoryLike<T> => ({
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
  findOneOrFail: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  query: jest.fn(),
  count: jest.fn(),
});
