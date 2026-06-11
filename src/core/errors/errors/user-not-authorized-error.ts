import { ServiceError } from "@/core/errors/service-error";

export class UserNotAuthorizedError extends Error implements ServiceError {
    constructor() {
        super(`User not authorized.`);
    }
}
