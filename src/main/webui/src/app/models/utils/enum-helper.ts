export class EnumHelper<T extends string> {
    private _enumObject: Record<T, number | string>;

    constructor(enumObject: Record<T, number | string>) {
        this._enumObject = enumObject;
    }

    getKeys(): T[] {
        return Object.keys(this._enumObject) as T[];
    }

    getValues(): (number | string)[] {
        return Object.values(this._enumObject);
    }

    getKeyByValue(value: string | number): T | undefined {
        return Object.keys(this._enumObject).find(key => this._enumObject[key as T] === value) as T | undefined;
    }
}