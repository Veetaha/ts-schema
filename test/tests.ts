import { describe, it }  from 'mocha';
import { assert }        from 'chai';
import { test, Schema, optional, TypeMismatch, validate, positiveInt, PathArray } from '../lib/index';
import { schemaSet } from '../lib/schema';

describe('test()', () => {
    it('must work as typeof when being forwarded a primitive type name as type description', () => {
        assert.isTrue(test('number',    23           ));
        assert.isTrue(test('boolean',   true         ));
        assert.isTrue(test('boolean',   false        ));
        assert.isTrue(test('object',    null         ));
        assert.isTrue(test('undefined', undefined    ));
        assert.isTrue(test('function',  () => {}     ));
        assert.isTrue(test('object',    {prop: null} ));
        assert.isTrue(test('symbol',    Symbol()     ));
        assert.isTrue(test('bigint',    2323n        ));
    });

    it('must deeply check objects properties', () => {
        assert.isTrue(test({str: 'string'}, {str: 'lala'}));
        assert.isTrue(test(
            {
                str:  'string',
                bool: 'boolean',
                obj: {
                    tuple: ['number']
                }
            },
            {
                str: 'lala',
                bool: true,
                obj: {
                    tuple: [23, 43]
                },
                someExcessProperty: null
            })
        );
    });
    it('must recognize one-item Schema array as a random length array', () => {
        assert.isTrue(test(
            [{id: 'number'}],
            []
        ));
        assert.isTrue(test(
            [{id: 'number'}],
            [{id: 22}]
        ));
        assert.isTrue(test(
            [{id: 'number'}],
            [{id: 22}, {id: 75}, {id: 55}]
        ));
    });
    it('must recognize schema arrays with >= 2 items as tuple limitations', () => {
        assert.isTrue(test(
            ['boolean', 'object', 'number', 'string'],
            [true, null, 22, 'str']
        ));
    });
    it ('must return true if schema is an empty array, and suspect is array of any type', () => {
        assert.isTrue( test([], [1, 2, null, false]));
        assert.isFalse(test([], { someObj: true}));
        assert.isTrue( test([], []));
    });

    it('must take empty arrays and empty objects apart', () => {
        assert.isTrue( test(['string'], []));
        assert.isTrue( test({}, {}));
        assert.isFalse(test([{objects: 'number'}], {}));
        assert.isFalse(test({}, []));
    });
    it('must return true if any schema in the schema set matches the value', () => {
        assert.isTrue(test(
            schemaSet({obj: 'number'}, 'string', 'number', ['boolean']),
            42
        ));
        assert.isFalse(test(
            schemaSet({obj: 'number'}, 'string', 'number', ['boolean']),
            {}
        ));

    });

    it('must use given predicate to validate the suspect', () => {
        assert.isTrue(test((suspect): suspect is number => suspect === 23, 23));
        assert.isTrue(test((suspect): suspect is string => suspect === 'str', 'str'));
        assert.isTrue(test({
            str: 'string',
            isEnumPred: (suspect): suspect is 58 | 4 | 43 => (
                typeof suspect === 'number' && [58, 4, 43].includes(suspect)
            )
        }, {
            str: 'Ruslan',
            isEnumPred: 43
        }
        ));
        assert.isFalse(test((_suspect): _suspect is number => false, true));
        assert.isTrue(test({ truePred: (_suspect): _suspect is never => true }, {}));
    });
});

describe('test({ noExcessProps: true })', () => {
    function testNoExcess(s: Schema, val: unknown) {
        return test(s, val, { noExcessProps: true });
    }

    it(`should return false when detected excess properties`, () => {
        assert.isFalse(testNoExcess(
        {
            prop: 'number'
        },
        {
            prop: 1,
            excessBool: true
        }
        ));
    });

    it(`should tolerate explicitly optional props`, () => {
        assert.isTrue(testNoExcess({
            literal_s: (s): s is 's' => s === 's',
            opt: optional('number')
        },
        {
            literal_s: 's'
        }));
        assert.isTrue(testNoExcess(
        {
            opt: optional('number'),
            opt2: optional('string')
        },
        {}
        ));
    });
});


describe('validate()', () => {
    it('should return TypeMismatch with the proper path when detected inconsistency', () => {
        assert.deepStrictEqual(validate('number', true), new TypeMismatch({
            actualValue:     true,
            expectedSchema: 'number',
            path: []
        }));
        const obj = { bool: true };
        assert.deepStrictEqual(validate([], obj), new TypeMismatch({
            actualValue:    obj,
            expectedSchema: [],
            path: []
        }));
        assert.deepStrictEqual(validate({ num: 'number'}, obj), new TypeMismatch({
            actualValue: undefined,
            expectedSchema: 'number',
            path: ['num']
        }));        
        const union = schemaSet(
            { num: 'number'}, 'string', 'number', ['boolean']
        );
        assert.deepStrictEqual(validate(union, obj), new TypeMismatch({
                actualValue:    obj,
                expectedSchema: union,
                path: []
            }
        ));
        assert.deepStrictEqual(
            validate(
                { nested1: { nested2: { str: 'string' } } }, 
                { nested1: { nested2: { str: 22 } } }
            ), 
            new TypeMismatch({
                actualValue:     22,
                expectedSchema: 'string',
                path: ['nested1', 'nested2', 'str']
            })
        );

        assert.deepStrictEqual(
            validate(
                { nested: { nestedArr: [{num: 'number'}] } },
                { nested: { nestedArr: [{num: 22}, {num: 32}, {num: 56}, { nim: 43}] } }
            ), 
            new TypeMismatch({
                actualValue:     undefined,
                expectedSchema:  'number',
                path: ['nested', 'nestedArr', 3, 'num']
        }));
        assert.deepStrictEqual(
            validate(
                { posInt: positiveInt }, 
                { posInt: 0 }
            ),
            new TypeMismatch({ 
                actualValue: 0, 
                expectedSchema: positiveInt,
                path: ['posInt'] 
            })
        );
    });
});

describe('TypeMismatch.pathString()', () => {
    function call(...path: PathArray) {
        return (new TypeMismatch({ path, actualValue: 0, expectedSchema: 'string'}))
                .pathString();
    }

    it('should return string "root" if path is an empty array', () => {
        assert.strictEqual(call(), 'root');
    });

    it('should wrap empty string path into computed property', () => {
        assert.strictEqual(call('foo', '', '', 'bar'), `root.foo[''][''].bar`);
    });

    it('should return unwrapped path parts if they are valid JS identifiers', 
        () => {
        assert.strictEqual(call('foo'), 'root.foo');
        assert.strictEqual(call('foo', 'bar', 'baz'), 'root.foo.bar.baz');
        assert.strictEqual(call('$id', '_id2', '__', '$$'), `root.$id._id2.__.$$`);
    });

    it(`should return wrapped path parts into ['*'] for computed ivalid JS identifiers`,
        () => {
        assert.strictEqual(
            call('invalid space', '  ', ' 34'), 
            `root['invalid space']['  '][' 34']`
        );
        }
    );

    it(`should return numbered properties without cuotes as [number]`,
        () => {
        assert.strictEqual(
            call(23, 0, NaN, Infinity, -45), 
            `root[23][0][NaN][Infinity][-45]`
        );
        }
    );

    it(`should confirm the example from README.md`, () => {
        assert.strictEqual(validate(
            { foo: { bar: { 'twenty two': [ { prop: 'string' } ] } } },
            {
                foo: {
                    bar: {
                        'twenty two': [
                            { prop: 'str' }, 
                            { prop: -23 }
                        ]
                    }
                }
            }
            )!.pathString(),
            `root.foo.bar['twenty two'][1].prop`
        );
    });
});
