import { randomUUID } from "node:crypto";

export class UniqueEntityID {
    private value: string;

    toString() {
        return this.value;
    }

    toValue() {
        return this.value;
    }

    constructor(value?: string) {
        this.value = value ?? randomUUID();
    }

    equals(id: UniqueEntityID) {
        if (id.toString() === this.value) return true;

        return false;
    }
}