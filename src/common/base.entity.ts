import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';

export abstract class BaseEntity {
  abstract prefix: string;

  @PrimaryColumn({
    length: 40,
  })
  id: string;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  protected createId() {
    // Allow seeds setting the id
    if (!this.id) {
      this.id = `${this.prefix.substr(0, 3)}_${v4()}`;
    }
  }
}
