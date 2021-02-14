import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class Tag extends BaseEntity {
  prefix = 'tag';

  @Column()
  name: string;

  constructor(props: Partial<Tag>) {
    super();
    Object.assign(this, props);
  }
}
