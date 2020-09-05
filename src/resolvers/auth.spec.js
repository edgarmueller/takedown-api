import { isAuthenticated } from "./auth";
import { ForbiddenError } from "apollo-server";

describe('isAuthenticated', () => {
    it('should throw ForbiddenError', () => {
        expect(() => isAuthenticated(undefined, undefined, { me: undefined })).toThrow(ForbiddenError);
    });
});
