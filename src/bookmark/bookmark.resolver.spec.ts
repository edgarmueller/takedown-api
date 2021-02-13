import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createRepositoryMock } from '../common/testing/mocks';
import { Bookmark } from './bookmark.entity';
import { BookmarkResolver } from './bookmark.resolver';
import { BookmarkService } from './bookmark.service';

describe('LinkResolver', () => {
  let resolver: BookmarkResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        BookmarkResolver,
        BookmarkService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: createRepositoryMock(),
        },
      ],
    }).compile();

    resolver = module.get<BookmarkResolver>(BookmarkResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
