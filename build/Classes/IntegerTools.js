export class IntegerTools {
    static supportedWidths = [8, 16, 32, 64];
    /** Convert an integer numeral from one radix to another without losing precision. */
    static convertBase(value, fromBase, toBase) {
        this.assertBase(fromBase);
        this.assertBase(toBase);
        const integer = this.parseInBase(value, fromBase);
        return integer.toString(toBase);
    }
    /** Represent an integer as a fixed-width signed or unsigned two's-complement value. */
    static formatFixedWidth(value, width, signedness, overflowMode = 'error') {
        this.assertWidth(width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const integer = this.parseDecimalInteger(value);
        const modulus = 1n << BigInt(width);
        const { min, max } = this.valueRange(width, signedness);
        if (overflowMode === 'error' && (integer < min || integer > max)) {
            throw new RangeError(`Value ${value} is outside the ${signedness} ${width}-bit range.`);
        }
        const unsigned = this.positiveModulo(integer, modulus);
        return this.representationFromUnsigned(unsigned, width, signedness);
    }
    /** Apply a fixed-width bitwise operation. Shift counts are limited to [0, width). */
    static bitwise(operation, leftValue, rightValue, width, signedness, overflowMode = 'error') {
        this.assertWidth(width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const left = this.bitsForValue(leftValue, width, signedness, overflowMode);
        const mask = (1n << BigInt(width)) - 1n;
        let result;
        switch (operation) {
            case 'and':
            case 'or':
            case 'xor': {
                if (rightValue === undefined) {
                    throw new TypeError(`Operation ${operation} requires a right operand.`);
                }
                const right = this.bitsForValue(rightValue, width, signedness, overflowMode);
                result = operation === 'and' ? left & right : operation === 'or' ? left | right : left ^ right;
                break;
            }
            case 'not':
                if (rightValue !== undefined) {
                    throw new TypeError('Operation not accepts only one operand.');
                }
                result = ~left;
                break;
            case 'shift_left':
            case 'logical_shift_right':
            case 'arithmetic_shift_right': {
                const shift = this.parseShift(rightValue, width);
                if (operation === 'shift_left') {
                    result = left << shift;
                }
                else if (operation === 'logical_shift_right') {
                    result = left >> shift;
                }
                else {
                    if (signedness !== 'signed') {
                        throw new TypeError('Arithmetic right shift requires signed values.');
                    }
                    const signedLeft = this.signedFromUnsigned(left, width);
                    result = signedLeft >> shift;
                }
                break;
            }
            default:
                throw new RangeError(`Unsupported bitwise operation: ${operation}`);
        }
        return this.representationFromUnsigned(result & mask, width, signedness);
    }
    static testBit(value, index, width, signedness, overflowMode = 'error') {
        this.assertBitIndex(index, width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const bits = this.bitsForValue(value, width, signedness, overflowMode);
        return ((bits >> BigInt(index)) & 1n) === 1n;
    }
    static extractBits(value, start, length, width, signedness, overflowMode = 'error') {
        this.assertWidth(width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        if (!Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length < 1 || start + length > width) {
            throw new RangeError(`Bit range must fit within the ${width}-bit value.`);
        }
        const bits = this.bitsForValue(value, width, signedness, overflowMode);
        const mask = (1n << BigInt(length)) - 1n;
        return ((bits >> BigInt(start)) & mask).toString();
    }
    static modifyBit(value, index, action, width, signedness, overflowMode = 'error') {
        this.assertBitIndex(index, width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const bits = this.bitsForValue(value, width, signedness, overflowMode);
        const bitMask = 1n << BigInt(index);
        let result;
        switch (action) {
            case 'set':
                result = bits | bitMask;
                break;
            case 'clear':
                result = bits & ~bitMask;
                break;
            case 'toggle':
                result = bits ^ bitMask;
                break;
            default:
                throw new RangeError(`Unsupported bit modification: ${action}`);
        }
        return this.representationFromUnsigned(result, width, signedness);
    }
    static toBytes(value, width, signedness, endianness, overflowMode = 'error') {
        this.assertEndianness(endianness);
        const representation = this.formatFixedWidth(value, width, signedness, overflowMode);
        const byteCount = width / 8;
        const unsigned = BigInt(representation.unsignedValue);
        const bytes = Array.from({ length: byteCount }, (_, index) => Number((unsigned >> BigInt(index * 8)) & 0xffn));
        if (endianness === 'big') {
            bytes.reverse();
        }
        const hexadecimal = `0x${bytes.map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
        return { bytes, hexadecimal, width: width, signedness, endianness };
    }
    static fromBytes(bytes, signedness, endianness) {
        this.assertSignedness(signedness);
        this.assertEndianness(endianness);
        if (![1, 2, 4, 8].includes(bytes.length)) {
            throw new RangeError('Byte arrays must contain 1, 2, 4, or 8 bytes.');
        }
        for (const byte of bytes) {
            if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
                throw new RangeError(`Invalid byte value: ${byte}`);
            }
        }
        let unsigned = 0n;
        if (endianness === 'big') {
            for (const byte of bytes) {
                unsigned = (unsigned << 8n) | BigInt(byte);
            }
        }
        else {
            for (let index = bytes.length - 1; index >= 0; index -= 1) {
                unsigned = (unsigned << 8n) | BigInt(bytes[index]);
            }
        }
        const width = bytes.length * 8;
        return (signedness === 'signed' ? this.signedFromUnsigned(unsigned, width) : unsigned).toString();
    }
    static parseDecimalInteger(value) {
        if (typeof value !== 'string' || !/^[+-]?\d+$/.test(value)) {
            throw new TypeError('Integer values must be supplied as decimal integer strings.');
        }
        return BigInt(value);
    }
    static parseInBase(value, base) {
        if (typeof value !== 'string' || !/^[+-]?[0-9a-z]+$/i.test(value)) {
            throw new TypeError('Value must be an integer numeral without prefixes or separators.');
        }
        const negative = value.startsWith('-');
        const digits = value.replace(/^[+-]/, '').toLowerCase();
        let result = 0n;
        for (const character of digits) {
            const code = character.charCodeAt(0);
            const digit = code >= 48 && code <= 57 ? code - 48 : code - 87;
            if (digit >= base) {
                throw new RangeError(`Digit '${character}' is not valid in base ${base}.`);
            }
            result = result * BigInt(base) + BigInt(digit);
        }
        return negative ? -result : result;
    }
    static assertBase(base) {
        if (!Number.isInteger(base) || base < 2 || base > 36) {
            throw new RangeError('Bases must be integers between 2 and 36.');
        }
    }
    static assertWidth(width) {
        if (!this.supportedWidths.includes(width)) {
            throw new RangeError('Width must be 8, 16, 32, or 64 bits.');
        }
    }
    static assertSignedness(signedness) {
        if (signedness !== 'signed' && signedness !== 'unsigned') {
            throw new TypeError('Signedness must be signed or unsigned.');
        }
    }
    static assertOverflowMode(mode) {
        if (mode !== 'error' && mode !== 'wrap') {
            throw new TypeError('Overflow mode must be error or wrap.');
        }
    }
    static assertEndianness(endianness) {
        if (endianness !== 'big' && endianness !== 'little') {
            throw new TypeError('Endianness must be big or little.');
        }
    }
    static assertBitIndex(index, width) {
        this.assertWidth(width);
        if (!Number.isInteger(index) || index < 0 || index >= width) {
            throw new RangeError(`Bit index must be between 0 and ${width - 1}.`);
        }
    }
    static valueRange(width, signedness) {
        if (signedness === 'unsigned') {
            return { min: 0n, max: (1n << BigInt(width)) - 1n };
        }
        const halfRange = 1n << BigInt(width - 1);
        return { min: -halfRange, max: halfRange - 1n };
    }
    static positiveModulo(value, modulus) {
        return ((value % modulus) + modulus) % modulus;
    }
    static signedFromUnsigned(unsigned, width) {
        const signBit = 1n << BigInt(width - 1);
        return unsigned >= signBit ? unsigned - (1n << BigInt(width)) : unsigned;
    }
    static representationFromUnsigned(unsigned, width, signedness) {
        const bits = unsigned.toString(2).padStart(width, '0');
        const hexadecimal = `0x${unsigned.toString(16).padStart(width / 4, '0')}`;
        const value = (signedness === 'signed' ? this.signedFromUnsigned(unsigned, width) : unsigned).toString();
        return {
            value,
            unsignedValue: unsigned.toString(),
            width: width,
            signedness,
            bits,
            hexadecimal,
        };
    }
    static bitsForValue(value, width, signedness, overflowMode) {
        const representation = this.formatFixedWidth(value, width, signedness, overflowMode);
        return BigInt(representation.unsignedValue);
    }
    static parseShift(value, width) {
        if (value === undefined) {
            throw new TypeError('Shift operations require a shift count.');
        }
        const shift = this.parseDecimalInteger(value);
        if (shift < 0n || shift >= BigInt(width)) {
            throw new RangeError(`Shift count must be between 0 and ${width - 1}.`);
        }
        return shift;
    }
}
