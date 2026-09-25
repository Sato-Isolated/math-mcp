export type IntegerWidth = 8 | 16 | 32 | 64;
export type Signedness = 'signed' | 'unsigned';
export type OverflowMode = 'error' | 'wrap';
export type Endianness = 'big' | 'little';
export type BitwiseOperation =
    | 'and'
    | 'or'
    | 'xor'
    | 'not'
    | 'shift_left'
    | 'logical_shift_right'
    | 'arithmetic_shift_right';
export type BitModification = 'set' | 'clear' | 'toggle';

export interface FixedWidthRepresentation {
    value: string;
    unsignedValue: string;
    width: IntegerWidth;
    signedness: Signedness;
    bits: string;
    hexadecimal: string;
}

export class IntegerTools {
    private static readonly supportedWidths = [8, 16, 32, 64] as const;

    /** Convert an integer numeral from one radix to another without losing precision. */
    static convertBase(value: string, fromBase: number, toBase: number): string {
        this.assertBase(fromBase);
        this.assertBase(toBase);

        const integer = this.parseInBase(value, fromBase);
        return integer.toString(toBase);
    }

    /** Represent an integer as a fixed-width signed or unsigned two's-complement value. */
    static formatFixedWidth(
        value: string,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode = 'error',
    ): FixedWidthRepresentation {
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
    static bitwise(
        operation: BitwiseOperation,
        leftValue: string,
        rightValue: string | undefined,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode = 'error',
    ): FixedWidthRepresentation {
        this.assertWidth(width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);

        const left = this.bitsForValue(leftValue, width, signedness, overflowMode);
        const mask = (1n << BigInt(width)) - 1n;
        let result: bigint;

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
                } else if (operation === 'logical_shift_right') {
                    result = left >> shift;
                } else {
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

    static testBit(
        value: string,
        index: number,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode = 'error',
    ): boolean {
        this.assertBitIndex(index, width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const bits = this.bitsForValue(value, width, signedness, overflowMode);
        return ((bits >> BigInt(index)) & 1n) === 1n;
    }

    static extractBits(
        value: string,
        start: number,
        length: number,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode = 'error',
    ): string {
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

    static modifyBit(
        value: string,
        index: number,
        action: BitModification,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode = 'error',
    ): FixedWidthRepresentation {
        this.assertBitIndex(index, width);
        this.assertSignedness(signedness);
        this.assertOverflowMode(overflowMode);
        const bits = this.bitsForValue(value, width, signedness, overflowMode);
        const bitMask = 1n << BigInt(index);
        let result: bigint;

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

    static toBytes(
        value: string,
        width: number,
        signedness: Signedness,
        endianness: Endianness,
        overflowMode: OverflowMode = 'error',
    ): { bytes: number[]; hexadecimal: string; width: IntegerWidth; signedness: Signedness; endianness: Endianness } {
        this.assertEndianness(endianness);
        const representation = this.formatFixedWidth(value, width, signedness, overflowMode);
        const byteCount = width / 8;
        const unsigned = BigInt(representation.unsignedValue);
        const bytes = Array.from({ length: byteCount }, (_, index) =>
            Number((unsigned >> BigInt(index * 8)) & 0xffn),
        );
        if (endianness === 'big') {
            bytes.reverse();
        }

        const hexadecimal = `0x${bytes.map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
        return { bytes, hexadecimal, width: width as IntegerWidth, signedness, endianness };
    }

    static fromBytes(bytes: readonly number[], signedness: Signedness, endianness: Endianness): string {
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
        } else {
            for (let index = bytes.length - 1; index >= 0; index -= 1) {
                unsigned = (unsigned << 8n) | BigInt(bytes[index]);
            }
        }

        const width = bytes.length * 8;
        return (signedness === 'signed' ? this.signedFromUnsigned(unsigned, width) : unsigned).toString();
    }

    private static parseDecimalInteger(value: string): bigint {
        if (typeof value !== 'string' || !/^[+-]?\d+$/.test(value)) {
            throw new TypeError('Integer values must be supplied as decimal integer strings.');
        }
        return BigInt(value);
    }

    private static parseInBase(value: string, base: number): bigint {
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

    private static assertBase(base: number): void {
        if (!Number.isInteger(base) || base < 2 || base > 36) {
            throw new RangeError('Bases must be integers between 2 and 36.');
        }
    }

    private static assertWidth(width: number): asserts width is IntegerWidth {
        if (!this.supportedWidths.includes(width as IntegerWidth)) {
            throw new RangeError('Width must be 8, 16, 32, or 64 bits.');
        }
    }

    private static assertSignedness(signedness: string): asserts signedness is Signedness {
        if (signedness !== 'signed' && signedness !== 'unsigned') {
            throw new TypeError('Signedness must be signed or unsigned.');
        }
    }

    private static assertOverflowMode(mode: string): asserts mode is OverflowMode {
        if (mode !== 'error' && mode !== 'wrap') {
            throw new TypeError('Overflow mode must be error or wrap.');
        }
    }

    private static assertEndianness(endianness: string): asserts endianness is Endianness {
        if (endianness !== 'big' && endianness !== 'little') {
            throw new TypeError('Endianness must be big or little.');
        }
    }

    private static assertBitIndex(index: number, width: number): void {
        this.assertWidth(width);
        if (!Number.isInteger(index) || index < 0 || index >= width) {
            throw new RangeError(`Bit index must be between 0 and ${width - 1}.`);
        }
    }

    private static valueRange(width: number, signedness: Signedness): { min: bigint; max: bigint } {
        if (signedness === 'unsigned') {
            return { min: 0n, max: (1n << BigInt(width)) - 1n };
        }
        const halfRange = 1n << BigInt(width - 1);
        return { min: -halfRange, max: halfRange - 1n };
    }

    private static positiveModulo(value: bigint, modulus: bigint): bigint {
        return ((value % modulus) + modulus) % modulus;
    }

    private static signedFromUnsigned(unsigned: bigint, width: number): bigint {
        const signBit = 1n << BigInt(width - 1);
        return unsigned >= signBit ? unsigned - (1n << BigInt(width)) : unsigned;
    }

    private static representationFromUnsigned(
        unsigned: bigint,
        width: number,
        signedness: Signedness,
    ): FixedWidthRepresentation {
        const bits = unsigned.toString(2).padStart(width, '0');
        const hexadecimal = `0x${unsigned.toString(16).padStart(width / 4, '0')}`;
        const value = (signedness === 'signed' ? this.signedFromUnsigned(unsigned, width) : unsigned).toString();
        return {
            value,
            unsignedValue: unsigned.toString(),
            width: width as IntegerWidth,
            signedness,
            bits,
            hexadecimal,
        };
    }

    private static bitsForValue(
        value: string,
        width: number,
        signedness: Signedness,
        overflowMode: OverflowMode,
    ): bigint {
        const representation = this.formatFixedWidth(value, width, signedness, overflowMode);
        return BigInt(representation.unsignedValue);
    }

    private static parseShift(value: string | undefined, width: number): bigint {
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
