/**
 * Energya Cables - 3D Factory Floor Machine Layout
 * Positions all 83 machines across 5 physical factory bays.
 */

import { createMachine3D } from './machineModels.js';

export function layoutAllMachines() {
  // --- BAY 1: Drawing & Bunching (DR: 1-7, BN: 61-68, RS: 9-14) ---
  // DR01 - DR07 (Machines 1-7)
  for (let i = 1; i <= 7; i++) {
    const x = -130 + (i % 2) * 14;
    const z = -80 + Math.floor(i / 2) * 32;
    createMachine3D(i, 'drawing', x, z);
  }

  // BN01 - BN08 (Machines 61-68)
  for (let i = 61; i <= 68; i++) {
    const idx = i - 61;
    const x = -105 + (idx % 2) * 14;
    const z = -80 + Math.floor(idx / 2) * 32;
    createMachine3D(i, 'buncher', x, z);
  }

  // RS01 - RS06 (Machines 9-14)
  for (let i = 9; i <= 14; i++) {
    const idx = i - 9;
    const x = -80 + (idx % 2) * 14;
    const z = -75 + Math.floor(idx / 2) * 36;
    createMachine3D(i, 'strander', x, z);
  }

  // --- BAY 2: Stranding & Cabling (CS: 15-16, DS: 17, CN: 18, TN: 19, ST: 57-60, SR/PR/BT/SZ: 53-56, SingleTwist: 78) ---
  const bay2Machines = [15, 16, 17, 18, 19, 57, 58, 59, 60, 53, 54, 55, 56, 78];
  bay2Machines.forEach((mId, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = -55 + col * 15;
    const z = -80 + row * 28;
    createMachine3D(mId, 'strander', x, z);
  });

  // --- BAY 3: CCV Lines (34-38) & Extrusion Lines (EX: 20-33) ---
  // CCV01 - CCV05: Massive Vertical Towers with catenary tubes!
  for (let i = 34; i <= 38; i++) {
    const idx = i - 34;
    const x = 16 + idx * 14;
    const z = -65;
    createMachine3D(i, 'ccv', x, z);
  }

  // EX01 - EX14 (Machines 20-33)
  for (let i = 20; i <= 33; i++) {
    const idx = i - 20;
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 14 + col * 15;
    const z = -20 + row * 26;
    createMachine3D(i, 'extruder', x, z);
  }

  // --- BAY 4: Screen, Tape & Armouring (CT: 39-41, CW: 42-44, DT: 45-52) ---
  const bay4Machines = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
  bay4Machines.forEach((mId, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 75 + col * 15;
    const z = -80 + row * 28;
    createMachine3D(mId, 'armouring', x, z);
  });

  // --- BAY 5: Coiling, Rewind & Finishing (CO: 69-73, RW: 74-77) ---
  const bay5Machines = [69, 70, 71, 72, 73, 74, 75, 76, 77];
  bay5Machines.forEach((mId, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 120 + col * 12;
    const z = -80 + row * 26;
    createMachine3D(mId, 'coiling', x, z);
  });
}
