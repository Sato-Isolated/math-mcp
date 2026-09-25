/**
 * Math MCP Server
 *
 * This file implements a Model Context Protocol (MCP) server that provides
 * various mathematical operations as tools. Each tool accepts numeric inputs
 * and returns the calculated result.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Arithmetic } from "./Classes/Arithmetic.js";
import { Statistics } from "./Classes/Statistics.js";
import { Trigonometric } from "./Classes/Trigonometric.js";
import { IntegerTools } from "./Classes/IntegerTools.js";
export default function createServer() {
    const mathServer = new McpServer({
        name: "math",
        version: "0.1.1"
    });
    /**
 * Addition operation
 * Adds two numbers and returns their sum
 */
    mathServer.registerTool("add", {
        description: "Adds two numbers together",
        inputSchema: {
            firstNumber: z.number().describe("The first addend"),
            secondNumber: z.number().describe("The second addend")
        }
    }, async ({ firstNumber, secondNumber }) => {
        const value = Arithmetic.add(firstNumber, secondNumber);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Subtraction operation
     * Subtracts the second number from the first number
     */
    mathServer.registerTool("subtract", {
        description: "Subtracts the second number from the first number",
        inputSchema: {
            minuend: z.number().describe("The number to subtract from (minuend)"),
            subtrahend: z.number().describe("The number being subtracted (subtrahend)")
        }
    }, async ({ minuend, subtrahend }) => {
        const value = Arithmetic.subtract(minuend, subtrahend);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Multiplication operation
     * Multiplies two numbers together
     */
    mathServer.registerTool("multiply", {
        description: "Multiplies two numbers together",
        inputSchema: {
            firstNumber: z.number().describe("The first number"),
            secondNumber: z.number().describe("The second number")
        }
    }, async ({ firstNumber, secondNumber }) => {
        const value = Arithmetic.multiply(firstNumber, secondNumber);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Division operation
     * Divides the first number by the second number
     */
    mathServer.registerTool("division", {
        description: "Divides the first number by the second number",
        inputSchema: {
            numerator: z.number().describe("The number being divided (numerator)"),
            denominator: z.number().describe("The number to divide by (denominator)")
        }
    }, async ({ numerator, denominator }) => {
        const value = Arithmetic.division(numerator, denominator);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Sum operation
     * Calculates the sum of an array of numbers
     */
    mathServer.registerTool("sum", {
        description: "Adds any number of numbers together",
        inputSchema: {
            numbers: z.array(z.number()).min(1).describe("Array of numbers to sum")
        }
    }, async ({ numbers }) => {
        const value = Arithmetic.sum(numbers);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Modulo operation
     * Finds the remainder of a division
     */
    mathServer.registerTool("modulo", {
        description: "Divides two numbers and returns the remainder",
        inputSchema: {
            numerator: z.number().describe("The number being divided (numerator)"),
            denominator: z.number().describe("The number to divide by (denominator)")
        }
    }, async ({ numerator, denominator }) => {
        const value = Arithmetic.modulo(numerator, denominator);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Mean operation
     * Calculates the arithmetic mean of an array of numbers
     */
    mathServer.registerTool("mean", {
        description: "Calculates the arithmetic mean of a list of numbers",
        inputSchema: {
            numbers: z.array(z.number()).min(1).describe("Array of numbers to find the mean of")
        }
    }, async ({ numbers }) => {
        const value = Statistics.mean(numbers);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Median operation
     * Calculates the median of an array of numbers
     */
    mathServer.registerTool("median", {
        description: "Calculates the median of a list of numbers",
        inputSchema: {
            numbers: z.array(z.number()).min(1).describe("Array of numbers to find the median of")
        }
    }, async ({ numbers }) => {
        const value = Statistics.median(numbers);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Mode operation
     * Finds the most common number in an array of numbers
     */
    mathServer.registerTool("mode", {
        description: "Finds the most common number in a list of numbers",
        inputSchema: {
            numbers: z.array(z.number()).describe("Array of numbers to find the mode of")
        }
    }, async ({ numbers }) => {
        const value = Statistics.mode(numbers);
        return {
            content: [{
                    type: "text",
                    text: `Entries (${value.modeResult.join(', ')}) appeared ${value.maxFrequency} times`
                }]
        };
    });
    /**
     * Minimum operation
     * Finds the smallest number in an array
     */
    mathServer.registerTool("min", {
        description: "Finds the minimum value from a list of numbers",
        inputSchema: {
            numbers: z.array(z.number()).describe("Array of numbers to find the minimum of")
        }
    }, async ({ numbers }) => {
        const value = Statistics.min(numbers);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Maximum operation
     * Finds the largest number in an array
     */
    mathServer.registerTool("max", {
        description: "Finds the maximum value from a list of numbers",
        inputSchema: {
            numbers: z.array(z.number()).describe("Array of numbers to find the maximum of")
        }
    }, async ({ numbers }) => {
        const value = Statistics.max(numbers);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Floor operation
     * Rounds a number down to the nearest integer
     */
    mathServer.registerTool("floor", {
        description: "Rounds a number down to the nearest integer",
        inputSchema: {
            number: z.number().describe("The number to round down"),
        }
    }, async ({ number }) => {
        const value = Arithmetic.floor(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Ceiling operation
     * Rounds a number up to the nearest integer
     */
    mathServer.registerTool("ceiling", {
        description: "Rounds a number up to the nearest integer",
        inputSchema: {
            number: z.number().describe("The number to round up"),
        }
    }, async ({ number }) => {
        const value = Arithmetic.ceil(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Round operation
     * Rounds a number to the nearest integer
     */
    mathServer.registerTool("round", {
        description: "Rounds a number to the nearest integer",
        inputSchema: {
            number: z.number().describe("The number to round"),
        }
    }, async ({ number }) => {
        const value = Arithmetic.round(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Sin operation
     * Calculates the sine of a number in radians
     */
    mathServer.registerTool("sin", {
        description: "Calculates the sine of a number in radians",
        inputSchema: {
            number: z.number().describe("The number in radians to find the sine of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.sin(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Arcsin operation
     * Calculates the arcsine (in radians) of a number
     */
    mathServer.registerTool("arcsin", {
        description: "Calculates the arcsine (in radians) of a number",
        inputSchema: {
            number: z.number().describe("The number to find the arcsine of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.arcsin(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Cos operation
     * Calculates the cosine of a number in radians
     */
    mathServer.registerTool("cos", {
        description: "Calculates the cosine of a number in radians",
        inputSchema: {
            number: z.number().describe("The number in radians to find the cosine of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.cos(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Arccos operation
     * Calculates the arccosine (in radians) of a number
     */
    mathServer.registerTool("arccos", {
        description: "Calculates the arccosine (in radians) of a number",
        inputSchema: {
            number: z.number().describe("The number to find the arccosine of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.arccos(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Tan operation
     * Calculates the tangent of a number in radians
     */
    mathServer.registerTool("tan", {
        description: "Calculates the tangent of a number in radians",
        inputSchema: {
            number: z.number().describe("The number in radians to find the tangent of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.tan(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Arctan operation
     * Calculates the arctangent (in radians) of a number
     */
    mathServer.registerTool("arctan", {
        description: "Calculates the arctangent (in radians) of a number",
        inputSchema: {
            number: z.number().describe("The number to find the arctangent of")
        }
    }, async ({ number }) => {
        const value = Trigonometric.arctan(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Radians to Degrees operation
     * Converts a radian value to its equivalent in degrees
     */
    mathServer.registerTool("radiansToDegrees", {
        description: "Converts a radian value to its equivalent in degrees",
        inputSchema: {
            number: z.number().describe("The number in radians to convert to degrees")
        }
    }, async ({ number }) => {
        const value = Trigonometric.radiansToDegrees(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    /**
     * Degrees to Radians operation
     * Converts a degree value to its equivalent in radians
     */
    mathServer.registerTool("degreesToRadians", {
        description: "Converts a degree value to its equivalent in radians",
        inputSchema: {
            number: z.number().describe("The number in degrees to convert to radians")
        }
    }, async ({ number }) => {
        const value = Trigonometric.degreesToRadians(number);
        return {
            content: [{
                    type: "text",
                    text: `${value}`
                }]
        };
    });
    const widthSchema = z.union([z.literal(8), z.literal(16), z.literal(32), z.literal(64)]);
    const signednessSchema = z.enum(["signed", "unsigned"]);
    const overflowSchema = z.enum(["error", "wrap"]).optional();
    const endiannessSchema = z.enum(["big", "little"]);
    mathServer.registerTool("convert_base", {
        description: "Converts an integer numeral between bases 2 and 36. Input digits are interpreted in fromBase; output digits use toBase.",
        inputSchema: {
            value: z.string().describe("Integer numeral without a base prefix; negative values are supported"),
            fromBase: z.number().int().min(2).max(36).describe("Base of the input numeral"),
            toBase: z.number().int().min(2).max(36).describe("Base to convert the numeral to"),
        }
    }, async ({ value, fromBase, toBase }) => ({
        content: [{ type: "text", text: IntegerTools.convertBase(value, fromBase, toBase) }]
    }));
    mathServer.registerTool("convert_integer", {
        description: "Returns the fixed-width signed or unsigned representation of an integer, including its binary and hexadecimal bit patterns. Signed values use two's complement.",
        inputSchema: {
            value: z.string().describe("Decimal integer string"),
            width: widthSchema.describe("Integer width in bits"),
            signedness: signednessSchema.describe("Interpret the bit pattern as signed or unsigned"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap modulo 2^width"),
        }
    }, async ({ value, width, signedness, overflowMode }) => ({
        content: [{ type: "text", text: JSON.stringify(IntegerTools.formatFixedWidth(value, width, signedness, overflowMode ?? "error")) }]
    }));
    mathServer.registerTool("bitwise", {
        description: "Applies a fixed-width bitwise operation. Shift counts must be less than width; arithmetic right shift requires signed values.",
        inputSchema: {
            operation: z.enum(["and", "or", "xor", "not", "shift_left", "logical_shift_right", "arithmetic_shift_right"]),
            leftValue: z.string().describe("Left operand as a decimal integer string"),
            rightValue: z.string().optional().describe("Right operand, or shift count; omit only for not"),
            width: widthSchema.describe("Integer width in bits"),
            signedness: signednessSchema.describe("Interpret the bit pattern as signed or unsigned"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap operands modulo 2^width"),
        }
    }, async ({ operation, leftValue, rightValue, width, signedness, overflowMode }) => ({
        content: [{ type: "text", text: JSON.stringify(IntegerTools.bitwise(operation, leftValue, rightValue, width, signedness, overflowMode ?? "error")) }]
    }));
    mathServer.registerTool("test_bit", {
        description: "Tests a bit in a fixed-width integer; bit index 0 is the least significant bit.",
        inputSchema: {
            value: z.string().describe("Decimal integer string"),
            index: z.number().int().min(0).describe("Bit index, starting at 0 for the least significant bit"),
            width: widthSchema.describe("Integer width in bits"),
            signedness: signednessSchema.describe("Interpret the bit pattern as signed or unsigned"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap modulo 2^width"),
        }
    }, async ({ value, index, width, signedness, overflowMode }) => ({
        content: [{ type: "text", text: String(IntegerTools.testBit(value, index, width, signedness, overflowMode ?? "error")) }]
    }));
    mathServer.registerTool("extract_bits", {
        description: "Extracts a bit field from a fixed-width integer; start is counted from the least significant bit.",
        inputSchema: {
            value: z.string().describe("Decimal integer string"),
            start: z.number().int().min(0).describe("Index of the least significant bit to extract"),
            length: z.number().int().min(1).describe("Number of bits to extract"),
            width: widthSchema.describe("Integer width in bits"),
            signedness: signednessSchema.describe("Interpret the input bit pattern as signed or unsigned"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap modulo 2^width"),
        }
    }, async ({ value, start, length, width, signedness, overflowMode }) => ({
        content: [{ type: "text", text: IntegerTools.extractBits(value, start, length, width, signedness, overflowMode ?? "error") }]
    }));
    mathServer.registerTool("modify_bit", {
        description: "Sets, clears, or toggles one bit in a fixed-width integer; bit index 0 is the least significant bit.",
        inputSchema: {
            value: z.string().describe("Decimal integer string"),
            index: z.number().int().min(0).describe("Bit index, starting at 0 for the least significant bit"),
            action: z.enum(["set", "clear", "toggle"]),
            width: widthSchema.describe("Integer width in bits"),
            signedness: signednessSchema.describe("Interpret the bit pattern as signed or unsigned"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap modulo 2^width"),
        }
    }, async ({ value, index, action, width, signedness, overflowMode }) => ({
        content: [{ type: "text", text: JSON.stringify(IntegerTools.modifyBit(value, index, action, width, signedness, overflowMode ?? "error")) }]
    }));
    mathServer.registerTool("integer_to_bytes", {
        description: "Encodes a fixed-width integer as bytes and a hexadecimal string in the requested byte order.",
        inputSchema: {
            value: z.string().describe("Decimal integer string"),
            width: widthSchema.describe("Integer width in bits (8, 16, 32, or 64)"),
            signedness: signednessSchema.describe("Encode as signed two's complement or unsigned"),
            endianness: endiannessSchema.describe("Byte order"),
            overflowMode: overflowSchema.describe("Use error by default, or wrap modulo 2^width"),
        }
    }, async ({ value, width, signedness, endianness, overflowMode }) => ({
        content: [{ type: "text", text: JSON.stringify(IntegerTools.toBytes(value, width, signedness, endianness, overflowMode ?? "error")) }]
    }));
    mathServer.registerTool("bytes_to_integer", {
        description: "Decodes 1, 2, 4, or 8 bytes as a signed or unsigned integer using the requested byte order.",
        inputSchema: {
            bytes: z.array(z.number().int().min(0).max(255)).describe("Byte values in the specified order"),
            signedness: signednessSchema.describe("Interpret bytes as signed two's complement or unsigned"),
            endianness: endiannessSchema.describe("Order of bytes in the input list"),
        }
    }, async ({ bytes, signedness, endianness }) => ({
        content: [{ type: "text", text: IntegerTools.fromBytes(bytes, signedness, endianness) }]
    }));
    return mathServer.server;
}
async function main() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running in stdio mode");
}
// By default run the server with stdio transport
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
