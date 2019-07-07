import { expect } from 'chai';
import * as userApi from './api';

describe('users', () => {
    describe('user(id: String!): User', () => {
        it('returns a user when user can be found', async () => {
            const expectedResult = {
                data: {
                    user: {
                        id: '2',
                        username: 'ddavids',
                        email: 'hello@david.com',
                        role: 'ADMIN',
                    },
                },
            };

            const result = await userApi.user({ id: '2' });

            expect(result.data).to.eql(expectedResult);
        });

        it('returns null when user cannot be found', async () => {
            const expectedResult = {
                data: {
                    user: null,
                },
            };

            const result = await userApi.user({ id: '42' });

            expect(result.data).to.eql(expectedResult);
        });

        it('returns an error because only admins can delete a user', async () => {
            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await userApi.signIn({
                login: 'rwieruch',
                password: 'rwieruch',
            });

            const {
                data: { errors },
            } = await userApi.deleteUser({ id: '2' }, token);

            expect(errors[0].message).to.eql('Not authorized as admin.');
        });
    });
});