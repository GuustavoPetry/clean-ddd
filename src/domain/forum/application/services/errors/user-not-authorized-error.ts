export class UserNotAuthorizedError extends Error {
    constructor() {
        super(`User not authorized`);
    }
}