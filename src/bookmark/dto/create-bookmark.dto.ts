import { InputType, Field } from '@nestjs/graphql';
import { IsUrl } from 'class-validator';
@InputType()
export class CreateBookmarkDto {
  @Field()
  @IsUrl()
  url: string;
}
