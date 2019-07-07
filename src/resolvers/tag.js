import { combineResolvers } from 'graphql-resolvers'
import { Sequelize } from 'sequelize';
import { isAuthenticated, isLinkOwner, isTagOwner } from './auth'
import pubsub, { EVENTS } from '../subscription';

export default {
    Query: {
        tags: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, me }) => {
                const cursorOpts = {
                    where: { userId: me.id }
                };
                const edges = await models.Tag.findAll({
                    ...cursorOpts
                });


                return { edges }
            }
        )
    },
    Mutation: {
        createTag: combineResolvers(
            isAuthenticated,
            async (parent, { name }, { me, models }) => {
                const tag = await models.Tag.create({
                    name,
                    userId: me.id,
                });

                console.log(">>>>>>>>>>>>>>", tag)

                pubsub.publish(EVENTS.TAG.CREATED, {
                    tagCreated: { tag }
                })

                return tag;
            }
        ),

        deleteTag: combineResolvers(
            isAuthenticated,
            isTagOwner,
            async (parent, { id }, { models }) => {
                return await models.Tag.destroy({ where: { id } });
            }
        )
    },
    Tag: {
        user: async (link, args, { loaders }) => {
            return await loaders.user.load(link.userId);
        },
        links: async (user, args, { models }) => {
            return await models.Tag.findAll({
                where: {
                    tag: user.id,
                }
            });
        }
    },
    
    Subscription: {
        tagCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.TAG.CREATED)
        }
    }
}
