// src/App.js

import React, { useState } from 'react';

// Константи для базисів та станів
const BASES = {
  RECTILINEAR: 'rectilinear',
  DIAGONAL: 'diagonal',
};

const STATES = {
  ZERO: 0,
  ONE: 1,
};

// Функція для генерації кубітів
const generateQubit = (basis, state) => {
  return { basis, state };
};

// Функція вимірювання кубіта
const measureQubit = (qubit, basis) => {
  if (qubit.basis === basis) {
    return qubit.state;
  }
  return Math.random() < 0.5 ? STATES.ZERO : STATES.ONE;
};

const BB84Simulation = () => {
  const [aliceQubits, setAliceQubits] = useState([]);
  const [bobMeasurements, setBobMeasurements] = useState([]);
  const [sharedKey, setSharedKey] = useState([]);

  // Генерація кубітів Алісою
  const generateAliceQubits = () => {
    const newQubits = Array.from({ length: 10 }, () => {
      const basis = Math.random() < 0.5 ? BASES.RECTILINEAR : BASES.DIAGONAL;
      const state = Math.random() < 0.5 ? STATES.ZERO : STATES.ONE;
      return generateQubit(basis, state);
    });
    setAliceQubits(newQubits);
  };

  // Вимірювання кубітів Бобом
  const measureBobQubits = () => {
    const measurements = aliceQubits.map((qubit) => {
      const randomBasis = Math.random() < 0.5 ? BASES.RECTILINEAR : BASES.DIAGONAL;
      const result = measureQubit(qubit, randomBasis);
      return { basis: randomBasis, result };
    });
    setBobMeasurements(measurements);
  };

  // Обчислення спільного ключа на основі узгоджених базисів
  const calculateSharedKey = () => {
    const key = aliceQubits
      .map((qubit, index) => (qubit.basis === bobMeasurements[index].basis ? qubit.state : null))
      .filter((bit) => bit !== null);
    setSharedKey(key);
  };

  return (
    <div>
      <h1>BB84 Protocol Simulation</h1>
      <button onClick={generateAliceQubits}>Generate Alice's Qubits</button>
      <button onClick={measureBobQubits} disabled={!aliceQubits.length}>Measure Bob's Qubits</button>
      <button onClick={calculateSharedKey} disabled={!bobMeasurements.length}>Calculate Shared Key</button>
      
      <div>
        <h2>Alice's Qubits:</h2>
        <pre>{JSON.stringify(aliceQubits, null, 2)}</pre>
      </div>
      
      <div>
        <h2>Bob's Measurements:</h2>
        <pre>{JSON.stringify(bobMeasurements, null, 2)}</pre>
      </div>

      <div>
        <h2>Shared Key:</h2>
        <pre>{JSON.stringify(sharedKey)}</pre>
      </div>
    </div>
  );
};

export default BB84Simulation;
