import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteBookmarkDto {
  @Field()
  bookmarkId: string;

  constructor(props: Partial<DeleteBookmarkDto>) {
    Object.assign(this, props);
  }
}
