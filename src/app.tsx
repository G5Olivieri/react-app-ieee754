import React, { useState } from "react";
import styled from "styled-components";
import { decimalToIEEE754 } from "./decimal-to-ieee754";

const BitBox = styled.span`
  display: inline-flex;
  width: 50px;
  height: 50px;
  border: 1px solid ${(props) => props.color};
  align-items: center;
  justify-content: center;
`;

type BitProps = {
  value: string;
  color: string;
};

export const Bit: React.FC<BitProps> = ({ value, color }) => {
  if (value !== "0" && value !== "1") {
    throw new Error("Bit must be 0 or 1");
  }

  return <BitBox color={color}>{value}</BitBox>;
};

type BitsProps = {
  repr: string;
};

export const F32: React.FC<BitsProps> = ({ repr }) => {
  if (repr.length !== 32) {
    throw new Error("Float32 must be length 32");
  }

  const sign = repr[0];
  const exp = repr.substring(1, 9);
  const mantissa = repr.substring(9);

  return (
    <div>
      <Bit value={sign} color="red" />
      {exp.split("").map((v, i) => (
        <Bit key={i} value={v} color="blue" />
      ))}
      {mantissa.split("").map((v, i) => (
        <Bit key={i} value={v} color="black" />
      ))}
    </div>
  );
};

export const App: React.FC = () => {
  const [value, setValue] = useState("");
  const [binary, setBinary] = useState("00000000000000000000000000000000");

  const handleCalculate = () => {
    setBinary(decimalToIEEE754(value, 32));
  };

  return (
    <div>
      <div>
        <input
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button onClick={handleCalculate}>calculate</button>
      </div>

      <F32 repr={binary} />
    </div>
  );
};
