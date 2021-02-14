import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetDeletedBookmarkDto {
  @Field()
  deleted: boolean;
  @Field()
  bookmarkId: string;

  constructor(props: Partial<GetDeletedBookmarkDto>) {
    Object.assign(this, props);
  }
}
