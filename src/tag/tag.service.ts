import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  async findOrCreate(tags: string[]): Promise<Tag[]> {
    if (tags.length === 0) {
      return;
    }
    const existingTags = await this.tagRepo.find({
      where: {
        name: In(tags),
      },
    });
    const existingTagsByName = existingTags.map(tag => tag.name);
    const newTagsByName = tags.filter(tag => !existingTagsByName.includes(tag));
    const newTags = await this.tagRepo.save(
      newTagsByName.map(tag => new Tag({ name: tag })),
    );
    return [...existingTags, ...newTags];
  }
}
