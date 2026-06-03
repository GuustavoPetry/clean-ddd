import { expect, test } from "vitest";
import { Either, left, rigth } from "./either";

function doSomething(shouldSucess: boolean): Either<string, number> {
    if (shouldSucess) {
        return rigth(10);
    }

    return left("error");
}

test("sucess", () => {
    const result = doSomething(true);

    expect(result.isRigth()).toBe(true);
    expect(result.isLeft()).toBe(false);
});

test("error", () => {
    const result = doSomething(false);

    expect(result.isRigth()).toBe(false);
    expect(result.isLeft()).toBe(true);
});