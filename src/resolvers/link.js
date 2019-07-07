import { combineResolvers } from 'graphql-resolvers'
import { Sequelize } from 'sequelize';
import { isAuthenticated, isLinkOwner } from './auth'
import pubsub, { EVENTS } from '../subscription';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
    Query: {
        links: combineResolvers(
            isAuthenticated,
            async (parent, { cursor, limit = 100 }, { models, me }) => {
                const cursorOpts = cursor ?
                    {
                        where: {
                            createdAt: {
                                [Sequelize.Op.lt]: fromCursorHash(cursor)
                            },
                            userId: me.id
                        }
                    } : {
                        where: { userId: me.id }
                    };
                const links = await models.Link.findAll({
                    order: [['createdAt', 'DESC']],
                    limit: limit + 1,
                    ...cursorOpts
                });
                const hasNextPage = links.length > limit;
                const edges = hasNextPage ? links.slice(0, -1) : links;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor: links.length === 0 ?
                            null : toCursorHash(
                                links[links.length - 1].createdAt.toString()
                            )
                    }
                }
            }),
        link: async (parent, { id }, { models }) => {
            return await models.Link.findByPk(id);
        },
    },
    Mutation: {
        createLink: combineResolvers(
            isAuthenticated,
            async (parent, { url, tags, title }, { me, models }) => {
                //const tags = await models.Tag.bulkCreate({
                //    tags,
                //    userId: me.id
                //});
                tags = tags.map(t => ({ name: t, userId: me.id }))
                const link = await models.Link.create({
                    url,
                    userId: me.id,
                    tags,
                    title
                }, { include: [models.Tag] } );

                pubsub.publish(EVENTS.LINK.CREATED, {
                    linkCreated: { link }
                })

                return link;
            }
        ),

        addTag: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { id, tag }, { models }) => {
                const link = await models.Link.findOne({ where: { id }, include: [models.Tag]});
                const newTag = await models.Tag.findOne({ where: { name: tag } });
                if (link) {
                    const tags = link.tags;
                    link.setTags([...tags, newTag]);
                    return link
                    //const res = await models.Link.Tags.updateAttributes({ tags: link.tags.concat([tag]) })
                    //const res = await models.Link.update({ tags: link.tags.concat([tag]) }, { where: { id }})
                }
            }
        ),

        setTags: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { id, tags }, { models, me }) => {
                const link = await models.Link.findOne({ where: { id }, include: [models.Tag]});
                const foundTags = await Promise.all(tags.map(tag => models.Tag.findOne({ where: { name: tag }})));
                const existingTags = foundTags.filter(t => !!t).map(t => t.name);
                const newTag = tags.filter(t => !existingTags.includes(t))
                console.log('waaaaaaaaaaaaaaaaaaat', newTag)
                let x
                if (newTag.length > 0) {
                    x = await models.Tag.create({ name: newTag[0], userId: me.id })
                }
                if (link) {
                    console.log('new tag??', x)
                    if (x) {
                        link.setTags([...foundTags.filter(t => !!t).map(t => t.id), x.id]);
                    } else {
                        console.log("??????????????????????????????????????????????????")
                        link.setTags([...foundTags.filter(t => !!t).map(t => t.id)]);
                    }
                    console.log("!!!!!!!!!!!!!la,", link)
                    return link;
                }
            }
        ),

        deleteLink: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { id }, { models }) => {
                return await models.Link.destroy({ where: { id } });
            }
        ),

        complete: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { done, id }, { models }) => {
                console.log('id', id)
                console.log('done', done)
                const [link, instances] =  await models.Link.update({ done }, { where: { id }, returning: true, plain: true });
                return instances;
            }
        )
    },
    Link: {
        user: async (link, args, { loaders }) => {
            return await loaders.user.load(link.userId);
        },
        tags: async (link, args, { models }) => {
            const t =  await models.Tag.findAll({
                include: [{
                    //model: models.Link,
                    //through: {
                    //    where: {
                    //        linkId: link.id
                    //    }
                    //}
                    model: models.Link,
                    through: 'linktags',
                    where: {
                        id: link.id
                    }
                    //}
                }]
            });
            return t.map(({name}) => name)
            //return t.filter(t => { return t && t.links && t.links.length > 0 && t.links[0].id === link.id }).map(({ name }) => name)
        }
    },
    Subscription: {
        linkCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.LINK.CREATED)
        }
    }
}
