export class Left<L, R> {
    readonly value: L;

    constructor(value: L) {
        this.value = value;
    }

    isRigth(): this is Rigth<L, R> {
        return false;
    }

    isLeft(): this is Left<L, R>  {
        return true;
    }
}

export class Rigth<L, R> {
    readonly value: R;

    constructor(value: R) {
        this.value = value;
    }

    isRigth(): this is Rigth<L, R> {
        return true;
    }

    isLeft(): this is Left<L, R> {
        return false;
    }
}

export type Either<L, R> = Left<L, R> | Rigth<L, R>;

export const left = <L, R>(value: L): Either<L, R> => {
    return new Left(value);
}

export const rigth = <L, R>(value: R): Either<L, R> => {
    return new Rigth(value);
}