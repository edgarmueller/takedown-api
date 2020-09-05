import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import { isAdmin } from './auth';
import { authenticateGoogle } from '../auth/passport'

const createToken = async (user, secret, expiresIn) => {
    const { id, email, username, role } = user;
    return await jwt.sign({ id, email, username, role }, secret, {
        expiresIn
    });
};

const TOKEN_TIMEOUT = '30m';

export default {
    Query: {
        users: async (parent, args, { models }) => {
            return await models.User.findAll();
        },
        user: async (parent, { id }, { models }) => {
            return await models.User.findByPk(id);
        },
        me: async (parent, args, { models, me }) => {
            return await models.User.findByPk(me.id);
        },
    },
    Mutation: {
        signUp: async (
            parent,
            { username, email, password },
            { models, secret },
        ) => {
            const user = await models.User.create({
                username,
                email,
                password,
            });

            return { token: createToken(user, secret, TOKEN_TIMEOUT) };
        },
        authGoogle: async (_, { input: { accessToken } }, { models, secret, req, res }) => {
            req.body = {
                ...req.body,
                access_token: accessToken,
            };

            try {
                // data contains the accessToken, refreshToken and profile from passport
                const { data, info } = await authenticateGoogle(req, res);
                if (data) {
                    const user = await models.User.upsertGoogleUser(data);

                    if (user) {
                        return ({
                            name: user.dataValues.username,
                            token: createToken(user, secret, '30m') //user.generateJWT(),
                        });
                    }
                }

                if (info) {
                    switch (info.code) {
                        case 'ETIMEDOUT':
                            return (new Error('Failed to reach Google: Try Again'));
                        default:
                            return (new Error('something went wrong'));
                    }
                }
                return (Error('server error'));
            } catch (error) {
                return error;
            }
        },
        signIn: async (
            parent,
            { login, password },
            { models, secret },
        ) => {
            const user = await models.User.findByLogin(login);

            if (!user) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            }

            const isValid = await user.validatePassword(password);

            if (!isValid) {
                throw new AuthenticationError('Invalid password.');
            }

            return { token: createToken(user, secret, '30m') };
        },
        deleteUser: combineResolvers(
            isAdmin,
            async (parent, { id }, { models }) => {
                return await models.User.destroy({
                    where: { id }
                })
            })
    },
    User: {
        links: async (user, args, { models }) => {
            return await models.Link.findAll({
                where: {
                    userId: user.id,
                },
            });
        }
    }
}
