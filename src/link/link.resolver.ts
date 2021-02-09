import { Query, Resolver } from '@nestjs/graphql';
import { Link } from './link.model';

@Resolver(() => Link)
export class LinkResolver {
  @Query(() => [Link])
  async links() {
    return [
      new Link({
        url:
          'https://blog.logrocket.com/how-to-build-a-graphql-api-with-nestjs/',
        title: 'How to build a GraphQL API with NestJS',
      }),
    ];
  }
}
