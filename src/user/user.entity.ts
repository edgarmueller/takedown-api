import { Column, Entity } from 'typeorm';
import { Provider } from '../auth/provider.enum';
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

  constructor(props: Partial<User>) {
    super();
    Object.assign(this, props);
  }
}
