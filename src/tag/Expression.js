// LICENSE : MIT
"use strict";
/**
 * @return {string}
 */
export function Expression(tagName, typeValue) {
    // https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler#record-type
    // > myObject that has a value of **any** type.
    if (typeValue === null) {
        return `typeof ${tagName} !== "undefined"`;
    }
    if (typeValue.type && typeValue.type === "NullableType") {
        // recursion
        const otherExpression = Expression(tagName, typeValue.expression);
        return `(${tagName} == null || ${otherExpression})`;
    } else if (typeValue.type && typeValue.type === "NonNullableType") {
        // recursion
        const otherExpression = Expression(tagName, typeValue.expression);
        return `(${tagName} != null && ${otherExpression})`;
    } else {
        const expectedType = typeofName(typeValue.name);
        if (expectedType == null) {
            const expectedName = typeValue.name;
            // Can not handle Object.Property type like @param {Custom.Type}
            if (/\w+\.\w+/.test(expectedName)) {
                return "true";
            }
            // if right-hand(expectedName) is undefined, return true
            // if right-hand is not function, return true
            // if right-hand is function && left-hand(tagName) instanceof right-hand(expectedName)
            // expectation, if left-hand is Array, use Array.isArray
            if (expectedName === "Array") {
                return `Array.isArray(${tagName})`;
            }
            return `(
                typeof Symbol === "function" && typeof Symbol.hasInstance === "symbol" && typeof ${expectedName} !== "undefined" && typeof ${expectedName}[Symbol.hasInstance] === "function" ?
                ${expectedName}[Symbol.hasInstance](${tagName}) :
                typeof ${expectedName} === "undefined" || typeof ${expectedName} !== "function" || ${tagName} instanceof ${expectedName}
            )`;
        } else {
            return `typeof ${tagName} === "${expectedType}"`;
        }
    }
}
// typeof
export function typeofName(nodeTypeName) {
    switch (nodeTypeName) {
        case "Object":
        case "object":
            return "object";
        case "function":
        case "Function":
            return "function";
        case "string":
        case "String":
            return "string";
        case "number":
        case "Number":
            return "number";
        case "boolean":
        case "Boolean":
            return "boolean";
        case "undefined":
            return "undefined";
        case "symbol":
        case "Symbol":
            return "symbol";
        default:
            return;
    }
}