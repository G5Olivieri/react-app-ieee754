const splitIntAndFrac = (value: string): [string, string] => {
  const first = value[0]
  if (first === '-' || first === '+') {
    return value.substring(1).split(".") as [string, string];
  }
  return value.split(".") as [string, string];
}

const extractSign = (value: string) => {
  if (value[0] === "-") {
    return "1";
  }
  return "0";
}

const integerToBinary = (value: string) => {
  let dec = parseInt(value, 10);
  let bin = "";
  while (dec > 0) {
    if (dec % 2 == 0) {
      bin = "0" + bin;
    } else {
      bin = "1" + bin;
    }
    dec = Math.floor(dec / 2);
  }
  if (dec % 2 == 1) {
    bin = "1" + bin;
  }

  return bin;
};

const decimalToFractionalBinary = (
  decimalValue: string,
  numberOfBits: number
) => {
  const maxDecimalValue = Math.pow(10, decimalValue.length);
  let binaryValue = "";
  let remainder = 0;
  let doubleValue = 0;
  let integerValue = parseInt(decimalValue);
  for (let i = 0; i < numberOfBits; i++) {
    doubleValue = integerValue * 2;
    remainder = doubleValue - maxDecimalValue;
    if (remainder >= 0) {
      binaryValue += "1";
    } else {
      binaryValue += "0";
    }
    integerValue = doubleValue % maxDecimalValue;
  }
  return binaryValue;
};

const addOne = (bits: string) => {
  let result = "";
  let shouldAdd = true;
  for (let i = bits.length - 1; i >= 0; i--) {
    if (shouldAdd) {
      if (bits[i] === "0") {
        result = "1" + result;
        shouldAdd = false;
      } else {
        result = "0" + result;
      }
    } else {
      result = bits[i] + result;
    }
  }
  return result;
};

const bitToNumber = (bit: string) => {
  return bit === "0" ? 0 : 1;
};

const binaryToFractionalDecimal = (binstr: string) => {
  return binstr.split("").reduce((acc, cur, i) => {
    // digit of the bit i * 2 ** -i
    return acc + bitToNumber(cur) * Math.pow(2, -1 * (i + 1));
  }, 0);
};

const calculateError = (num: number, approx: number) => {
  return Math.abs(num - approx) / num;
};

export const buildIEEE754FromBits = (
  signBit: string,
  intBinary: string,
  fracBinary: string,
  nBits: number
) => {
  if (nBits != 32) {
    // TODO: accept double precision
    throw new Error("Supported only f32");
  }
  let mantissa = "";
  let exponent = 0;
  if (intBinary !== "") {
    exponent = intBinary.length - 1;
    mantissa = (intBinary.substring(1) + fracBinary).substring(0, 23);
  } else {
    for (let i of fracBinary) {
      if (i === "0") {
        exponent--;
      } else {
        exponent--;
        break;
      }
    }
    mantissa = fracBinary.substring(Math.abs(exponent)).substring(0, 23);
  }
  const bias = 127; // TODO: change this when add more bits
  const exponentBinary = integerToBinary((bias + exponent).toString());
  return signBit + exponentBinary.padStart(8, "0") + mantissa.padEnd(23, "0");
};

export const decimalToIEEE764 = (value: string, nbits: number) => {
  let sign = extractSign(value);
  const [integer, frac] =
    splitIntAndFrac(value);
  const binaryInteger = integerToBinary(integer);

  const binaryFracMin = decimalToFractionalBinary(frac, nbits);
  const decimalFracMin = binaryToFractionalDecimal(binaryFracMin);
  const errorMin = calculateError(
    parseInt(frac),
    Math.pow(10, frac.length) * decimalFracMin
  );

  const binaryFracMax = addOne(binaryFracMin);
  const decimalFracMax = binaryToFractionalDecimal(binaryFracMax);
  const errorMax = calculateError(
    parseInt(frac),
    Math.pow(10, frac.length) * decimalFracMax
  );

  if (errorMin < errorMax) {
    return buildIEEE754FromBits(sign, binaryInteger, binaryFracMin, nbits);
  }

  return buildIEEE754FromBits(sign, binaryInteger, binaryFracMax, nbits);
};
