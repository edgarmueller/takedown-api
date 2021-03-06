import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetBookmarkDto {
  @Field()
  id: string;

  @Field()
  url: string;

  @Field()
  title: string;

  @Field()
  thumbnailId: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  createdAt: string;

  constructor(props: Partial<GetBookmarkDto>) {
    Object.assign(this, props);
  }
}
