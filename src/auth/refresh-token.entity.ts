import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class RefreshToken extends BaseEntity {
  prefix = 'rft';
  @Column()
  userId: string;

  @Column()
  isRevoked: boolean;

  @Column()
  expiresAt: Date;

  constructor(props: Partial<RefreshToken>) {
    super();
    Object.assign(this, props);
  }
}
