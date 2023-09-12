export interface IModel{
    toObject: () => object;
    toPublicObject: () => object;
    stringify: () => string;
}