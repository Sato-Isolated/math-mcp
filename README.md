# Math-MCP

A Model Context Protocol (MCP) server that provides arithmetic, statistics, trigonometry, and integer programming tools to Large Language Models (LLMs). It enables accurate calculations and common fixed-width integer operations through a simple API.

<a href="https://glama.ai/mcp/servers/exa5lt8dgd">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/exa5lt8dgd/badge" alt="Math-MCP MCP server" />
</a>

## Features

- Basic arithmetic operations (addition, subtraction, multiplication, division, sum, modulo)
- Integer programming tools (base conversion, fixed-width representations, bitwise operations, bit fields, and byte order conversion)
- Statistical functions (mean, median, mode, min, max)
- Rounding functions (floor, ceiling, round)
- Trigonometric functions (sin, cos, tan, and their inverses; degrees/radians conversions)

## Installation
> **Note:** Node.js 22.12.0 or newer is required. Vitest 5 supports Node.js 22.12+ (22.x), 24.x, and 26.0.0 or newer. Install Node.js from [nodejs.org](https://nodejs.org/en/download).

Just clone this repository and save it locally somewhere on your computer.

Then add this server to your MCP configuration file:

```json
"math": {
  "command": "node",
  "args": ["PATH\\TO\\PROJECT\\math-mcp\\build\\index.js"]
}
```

Here is an example for OpenCode

```json
{
  "mcp": {
    "math-mcp": {
      "type": "local",
      "command": [
        "node",
        "PATH\\TO\\PROJECT\\math-mcp\\build\\index.js"
      ]
    }
  }
}
```

Replace `PATH\\TO\\PROJECT` with the actual path to where you cloned the repository.

> **Note:** This project comes prebuilt, so installation is easy but if you change anything in the code, rebuild the project with `npm run build`.

## Available Functions

The Math-MCP server provides the following mathematical operations:

### Arithmetic Operations
| Function | Description | Parameters |
|----------|-------------|------------|
| `add` | Adds two numbers together | `firstNumber`: The first addend<br>`secondNumber`: The second addend |
| `subtract` | Subtracts the second number from the first number | `minuend`: The number to subtract from (minuend)<br>`subtrahend`: The number being subtracted (subtrahend) |
| `multiply` | Multiplies two numbers together | `firstNumber`: The first number<br>`secondNumber`: The second number |
| `division` | Divides the first number by the second number | `numerator`: The number being divided (numerator)<br>`denominator`: The number to divide by (denominator) |
| `sum` | Adds any number of numbers together | `numbers`: Array of numbers to sum |
| `modulo` | Divides two numbers and returns the remainder | `numerator`: The number being divided (numerator)<br>`denominator`: The number to divide by (denominator) |
| `floor` | Rounds a number down to the nearest integer | `number`: The number to round down |
| `ceiling` | Rounds a number up to the nearest integer | `number`: The number to round up |
| `round` | Rounds a number to the nearest integer | `number`: The number to round |

### Integer and Bitwise Operations

Integer inputs and results use decimal strings where precision may exceed JavaScript's safe integer range. Base conversion accepts digits without prefixes (`0x`, `0b`, etc.); input digits are case-insensitive and output digits are lowercase. Fixed-width tools support 8, 16, 32, and 64 bits. Signed representations use two's complement. Values outside the selected range produce an error by default; set `overflowMode` to `wrap` to reduce the value modulo 2<sup>width</sup>.

| Function | Description | Parameters |
|----------|-------------|------------|
| `convert_base` | Converts an integer numeral between bases 2 and 36 | `value`: numeral as a string<br>`fromBase`: input base<br>`toBase`: output base |
| `convert_integer` | Returns the fixed-width decimal value, bit pattern, and hex pattern | `value`: decimal integer string<br>`width`: 8, 16, 32, or 64<br>`signedness`: `signed` or `unsigned`<br>`overflowMode`: optional `error` or `wrap` |
| `bitwise` | Applies AND, OR, XOR, NOT, or a fixed-width shift | `operation`: `and`, `or`, `xor`, `not`, `shift_left`, `logical_shift_right`, or `arithmetic_shift_right`<br>`leftValue`: decimal integer string<br>`rightValue`: second operand or shift count; omit for `not`<br>`width`, `signedness`, optional `overflowMode` |
| `test_bit` | Tests one bit; index 0 is the least significant bit | `value`, `index`, `width`, `signedness`, optional `overflowMode` |
| `extract_bits` | Extracts a bit field; `start` is counted from the least significant bit | `value`, `start`, `length`, `width`, `signedness`, optional `overflowMode` |
| `modify_bit` | Sets, clears, or toggles one bit | `value`, `index`, `action` (`set`, `clear`, or `toggle`), `width`, `signedness`, optional `overflowMode` |
| `integer_to_bytes` | Encodes an integer as a byte list and hexadecimal string | `value`, `width`, `signedness`, `endianness` (`big` or `little`), optional `overflowMode` |
| `bytes_to_integer` | Decodes a list of 1, 2, 4, or 8 bytes as an integer | `bytes`: byte values from 0 to 255<br>`signedness`: `signed` or `unsigned`<br>`endianness`: `big` or `little` |

For bitwise shifts, the shift count must be less than the width. Arithmetic right shift requires `signedness: "signed"`; logical right shift fills with zero bits.

### Statistical Operations
| Function | Description | Parameters |
|----------|-------------|------------|
| `mean` | Calculates the arithmetic mean of a list of numbers | `numbers`: Array of numbers to find the mean of |
| `median` | Calculates the median of a list of numbers | `numbers`: Array of numbers to find the median of |
| `mode` | Finds the most common number in a list of numbers | `numbers`: Array of numbers to find the mode of |
| `min` | Finds the minimum value from a list of numbers | `numbers`: Array of numbers to find the minimum of |
| `max` | Finds the maximum value from a list of numbers | `numbers`: Array of numbers to find the maximum of |

### Trigonometric Operations
| Function | Description | Parameters |
|----------|-------------|------------|
| `sin` | Calculates the sine of a number in radians | `number`: The number in radians to find the sine of |
| `arcsin` | Calculates the arcsine (in radians) of a number | `number`: The number to find the arcsine of |
| `cos` | Calculates the cosine of a number in radians | `number`: The number in radians to find the cosine of |
| `arccos` | Calculates the arccosine (in radians) of a number | `number`: The number to find the arccosine of |
| `tan` | Calculates the tangent of a number in radians | `number`: The number in radians to find the tangent of |
| `arctan` | Calculates the arctangent (in radians) of a number | `number`: The number to find the arctangent of |
| `radiansToDegrees` | Converts a radian value to its equivalent in degrees | `number`: The number in radians to convert to degrees |
| `degreesToRadians` | Converts a degree value to its equivalent in radians | `number`: The number in degrees to convert to radians |
