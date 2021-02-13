import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetBookmarkDto {
  @Field()
  url: string;

  @Field()
  title: string;

  constructor(props: Partial<GetBookmarkDto>) {
    Object.assign(this, props);
  }
}
