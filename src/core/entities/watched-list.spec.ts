import { WatchedList } from "./watched-list";
import { expect, it, describe } from "vitest";

class NumberWatchedList extends WatchedList<number> {
    compareItems(a: number, b: number): boolean {
        return a === b;
    }

}

describe("Watched List", () => {
    it("should be able to create a watched list with initial items", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        expect(list.currentItems).toHaveLength(3);
    });

    it("shoul be able to add a new item in the watched list", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        list.add(4);

        expect(list.currentItems).toHaveLength(4);
        expect(list.getNewItems()).toEqual([4]);
    });

    it("should be able to remove items of watched list", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        list.remove(2);

        expect(list.currentItems).toEqual([1, 3]);
        expect(list.getRemovedItems()).toEqual([2]);
    });

    it("should be able to add a item even if it has been removed before", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        list.remove(2);
        expect(list.currentItems).toEqual([1, 3]);

        list.add(2);

        expect(list.currentItems).toEqual([1, 3, 2]);
        expect(list.getRemovedItems()).toEqual([]);
        expect(list.getNewItems()).toEqual([]);
    });

    it("should be able to remove a item even if it has been added before", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        list.add(4);

        list.remove(4);

        expect(list.currentItems).toHaveLength(3);
        expect(list.getNewItems()).toEqual([])
        expect(list.getRemovedItems()).toEqual([]);
    });

    it("should be able to update a watch list", () => {
        const list = new NumberWatchedList([1, 2, 3]);

        list.update([1, 3, 5]);

        expect(list.getNewItems()).toEqual([5]);
        expect(list.getRemovedItems()).toEqual([2]);
    });
});