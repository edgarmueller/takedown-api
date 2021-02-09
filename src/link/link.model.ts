import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Link {
  @Field(() => String)
  url: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  thumbnailId: string;

  @Field(() => Boolean)
  done: boolean;

  @Field(() => Boolean)
  deleted: boolean;

  constructor(props: Partial<Link>) {
    Object.assign(this, props);
  }
}
