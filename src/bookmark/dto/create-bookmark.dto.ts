import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsUrl } from 'class-validator';
@InputType()
export class CreateBookmarkDto {
  @Field()
  @IsUrl()
  url: string;

  @Field(() => [String], {
    nullable: true,
  })
  @IsArray()
  tags: string[];
}
