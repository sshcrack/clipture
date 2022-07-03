export type addPrefix<TKey, TPrefix extends string> = TKey extends string
    ? `${TPrefix}${TKey}`
    : never;

export type removePrefix<TPrefixedKey, TPrefix extends string> = TPrefixedKey extends addPrefix<infer TKey, TPrefix>
    ? TKey
    : '';

export type prefixedValue<TObject extends object, TPrefixedKey extends string, TPrefix extends string> = TObject extends { [K in removePrefix<TPrefixedKey, TPrefix>]: infer TValue }
    ? TValue
    : never;


export type addPrefixToObject<TObject extends object, TPrefix extends string> = {
    [K in addPrefix<keyof TObject, TPrefix>]: prefixedValue<TObject, K, TPrefix>
}

export type addPrefixUnderscoreToObject<TObject extends object, TPrefix extends string> = addPrefixToObject<TObject, `${TPrefix}_`>