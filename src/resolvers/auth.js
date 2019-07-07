import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');

export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { role }}) =>
        role === 'ADMIN'
            ? skip
            : new ForbiddenError("Not authorized as admin.")
)

export const isLinkOwner = async (
    parent,
    { id },
    { models, me }
) => {
    const link = await models.Link.findByPk(id, { raw: true });
    if (link.userId !== me.id) {
        throw new ForbiddenError("Not authenticated as owner.")
    }
    return skip;
}

export const isTagOwner = async (
    parent,
    { id },
    { models, me }
) => {
    const tag = await models.Tag.findByPk(id, { raw: true });
    if (tag.userId !== me.id) {
        throw new ForbiddenError("Not authenticated as owner.")
    }
    return skip;
}