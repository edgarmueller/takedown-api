import { combineResolvers } from 'graphql-resolvers'
import { Sequelize, Op } from 'sequelize';
import { isAuthenticated, isLinkOwner } from './auth'
import pubsub, { EVENTS } from '../subscription';
import { get, fetchTitle } from '../quickshot'
const cloudinary = require('cloudinary').v2

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadStream(fileBuffer, options) {
  return new Promise((resolve, reject) => {
    // Sadly, this method does not support async/await
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(fileBuffer);
  })
}


export default {
    Query: {
        links: combineResolvers(
            isAuthenticated,
            async (parent, { cursor, limit = 100 }, { models, me }) => {
                const where = {
                  userId: me.id,
                };
                const cursorOpts = cursor ?
                    {
                        where: {
                            createdAt: {
                                [Sequelize.Op.lt]: fromCursorHash(cursor)
                            },
                            ...where
                        }
                    } : { where };
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
                            null : 
                            toCursorHash(links[links.length - 1].createdAt.toString())
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
            async (parent, { url, tags }, { me, models }) => {
                tags = tags.map(t => ({ name: t, userId: me.id }))

                const pageTitle = await fetchTitle(url);

                const resp = await new Promise((resolve, reject) => {
                    get(url, async function (err, data) {
                        if (err) {
                            reject(data);
                        }
                        const resp = await uploadStream(
                            data,
                            {
                                resource_type: "image",
                                // TODO 
                                overwrite: true
                            }
                        );
                        const link = await models.Link.create({
                            url,
                            userId: me.id,
                            tags,
                            title: pageTitle,
                            thumbnailId: resp.public_id
                        }, { include: [models.Tag] });
                        pubsub.publish(EVENTS.LINK.CREATED, { linkCreated: { link } });
                        resolve(link);
                    });
                });
                return resp;
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
                let tag
                if (newTag.length > 0) {
                    tag = await models.Tag.create({ name: newTag[0], userId: me.id })
                }
                if (link) {
                    if (tag) {
                        link.setTags([...foundTags.filter(t => !!t).map(t => t.id), tag.id]);
                    } else {
                        link.setTags([...foundTags.filter(t => !!t).map(t => t.id)]);
                    }
                    return link;
                }
            }
        ),

        deleteLink: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { id, deleted }, { models }) => {
                await models.Link.update({ deleted }, { where: { id }, returning: true, plain: true });
                return true;
            }
        ),

        complete: combineResolvers(
            isAuthenticated,
            isLinkOwner,
            async (parent, { done, id }, { models }) => {
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
                    model: models.Link,
                    through: 'linktags',
                    where: {
                        id: link.id
                    }
                }]
            });
            return t.map(({name}) => name)
        }
    },
    Subscription: {
        linkCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.LINK.CREATED)
        }
    }
}
