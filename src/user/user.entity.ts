import { Column, Entity, OneToMany } from 'typeorm';
import { Provider } from '../auth/provider.enum';
import { Bookmark } from '../bookmark/bookmark.entity';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class User extends BaseEntity {
  prefix = 'usr';

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: Provider,
  })
  provider: Provider;

  @Column()
  thirdPartyId: string;

  @OneToMany(
    () => Bookmark,
    bookmark => bookmark.user,
  )
  bookmarks: Bookmark[];

  constructor(props: Partial<User>) {
    super();
    Object.assign(this, props);
  }
}
