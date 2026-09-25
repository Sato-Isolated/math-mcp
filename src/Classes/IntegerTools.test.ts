import { describe, expect, it } from 'vitest';
import { IntegerTools } from './IntegerTools.js';

describe('IntegerTools.convertBase()', () => {
    it('converts between common and intermediate bases', () => {
        expect(IntegerTools.convertBase('255', 10, 2)).toBe('11111111');
        expect(IntegerTools.convertBase('FF', 16, 10)).toBe('255');
        expect(IntegerTools.convertBase('z', 36, 10)).toBe('35');
    });

    it('preserves signed arbitrary-precision values', () => {
        expect(IntegerTools.convertBase('-123456789012345678901234567890', 10, 16))
            .toBe('-18ee90ff6c373e0ee4e3f0ad2');
        expect(IntegerTools.convertBase('-101010', 2, 10)).toBe('-42');
    });

    it('rejects invalid digits and bases', () => {
        expect(() => IntegerTools.convertBase('2', 2, 10)).toThrow(RangeError);
        expect(() => IntegerTools.convertBase('10', 1, 10)).toThrow(RangeError);
        expect(() => IntegerTools.convertBase('1.5', 10, 2)).toThrow(TypeError);
    });
});

describe('IntegerTools.formatFixedWidth()', () => {
    it('returns a padded two-complement bit and hex representation', () => {
        expect(IntegerTools.formatFixedWidth('127', 8, 'signed')).toEqual({
            value: '127',
            unsignedValue: '127',
            width: 8,
            signedness: 'signed',
            bits: '01111111',
            hexadecimal: '0x7f',
        });
        expect(IntegerTools.formatFixedWidth('-128', 8, 'signed').bits).toBe('10000000');
    });

    it('rejects values outside the selected range by default', () => {
        expect(() => IntegerTools.formatFixedWidth('128', 8, 'signed')).toThrow(RangeError);
        expect(() => IntegerTools.formatFixedWidth('-1', 8, 'unsigned')).toThrow(RangeError);
    });

    it('wraps values modulo the width when explicitly requested', () => {
        expect(IntegerTools.formatFixedWidth('255', 8, 'signed', 'wrap').value).toBe('-1');
        expect(IntegerTools.formatFixedWidth('-1', 8, 'unsigned', 'wrap').value).toBe('255');
    });

    it('rejects unsupported widths and non-integer values', () => {
        expect(() => IntegerTools.formatFixedWidth('1', 24, 'unsigned')).toThrow(RangeError);
        expect(() => IntegerTools.formatFixedWidth('1.2', 8, 'unsigned')).toThrow(TypeError);
    });
});

describe('IntegerTools.bitwise()', () => {
    it('supports bitwise binary operations and not within a fixed width', () => {
        expect(IntegerTools.bitwise('and', '10', '12', 8, 'unsigned').value).toBe('8');
        expect(IntegerTools.bitwise('or', '10', '12', 8, 'unsigned').value).toBe('14');
        expect(IntegerTools.bitwise('xor', '10', '12', 8, 'unsigned').value).toBe('6');
        expect(IntegerTools.bitwise('not', '0', undefined, 8, 'unsigned').value).toBe('255');
    });

    it('supports shifts with fixed-width wrapping and signed arithmetic shift', () => {
        expect(IntegerTools.bitwise('shift_left', '128', '1', 8, 'unsigned', 'wrap').value).toBe('0');
        expect(IntegerTools.bitwise('logical_shift_right', '128', '1', 8, 'unsigned').value).toBe('64');
        expect(IntegerTools.bitwise('arithmetic_shift_right', '-4', '1', 8, 'signed').value).toBe('-2');
    });

    it('validates operands, signedness, and shift counts', () => {
        expect(() => IntegerTools.bitwise('and', '1', undefined, 8, 'unsigned')).toThrow(TypeError);
        expect(() => IntegerTools.bitwise('arithmetic_shift_right', '4', '1', 8, 'unsigned')).toThrow(TypeError);
        expect(() => IntegerTools.bitwise('shift_left', '1', '8', 8, 'unsigned')).toThrow(RangeError);
    });
});

describe('IntegerTools bit inspection and modification', () => {
    it('tests and extracts bits', () => {
        expect(IntegerTools.testBit('10', 3, 8, 'unsigned')).toBe(true);
        expect(IntegerTools.testBit('10', 0, 8, 'unsigned')).toBe(false);
        expect(IntegerTools.extractBits('181', 2, 3, 8, 'unsigned')).toBe('5');
    });

    it('sets, clears, and toggles a bit', () => {
        expect(IntegerTools.modifyBit('0', 2, 'set', 8, 'unsigned').value).toBe('4');
        expect(IntegerTools.modifyBit('15', 2, 'clear', 8, 'unsigned').value).toBe('11');
        expect(IntegerTools.modifyBit('8', 3, 'toggle', 8, 'unsigned').value).toBe('0');
    });

    it('rejects bit ranges outside the selected width', () => {
        expect(() => IntegerTools.testBit('0', 8, 8, 'unsigned')).toThrow(RangeError);
        expect(() => IntegerTools.extractBits('0', 7, 2, 8, 'unsigned')).toThrow(RangeError);
        expect(() => IntegerTools.extractBits('0', 0, 0, 8, 'unsigned')).toThrow(RangeError);
    });
});

describe('IntegerTools byte conversion', () => {
    it('encodes bytes in big-endian and little-endian order', () => {
        expect(IntegerTools.toBytes('305419896', 32, 'unsigned', 'big')).toEqual({
            bytes: [0x12, 0x34, 0x56, 0x78],
            hexadecimal: '0x12345678',
            width: 32,
            signedness: 'unsigned',
            endianness: 'big',
        });
        expect(IntegerTools.toBytes('305419896', 32, 'unsigned', 'little').bytes)
            .toEqual([0x78, 0x56, 0x34, 0x12]);
    });

    it('encodes negative signed values with two-complement bytes', () => {
        expect(IntegerTools.toBytes('-2', 16, 'signed', 'big').hexadecimal).toBe('0xfffe');
    });

    it('decodes both endiannesses and signed two-complement values', () => {
        expect(IntegerTools.fromBytes([0x12, 0x34, 0x56, 0x78], 'unsigned', 'big')).toBe('305419896');
        expect(IntegerTools.fromBytes([0x78, 0x56, 0x34, 0x12], 'unsigned', 'little')).toBe('305419896');
        expect(IntegerTools.fromBytes([0xff, 0xfe], 'signed', 'big')).toBe('-2');
    });

    it('rejects invalid byte values and unsupported byte lengths', () => {
        expect(() => IntegerTools.fromBytes([256], 'unsigned', 'big')).toThrow(RangeError);
        expect(() => IntegerTools.fromBytes([1, 2, 3], 'unsigned', 'big')).toThrow(RangeError);
    });
});
