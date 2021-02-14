import { TagModule } from './../tag/tag.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';
import { BookmarkResolver } from './bookmark.resolver';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Bookmark]), TagModule],
  providers: [BookmarkResolver, BookmarkService],
})
export class BookmarkModule {}
