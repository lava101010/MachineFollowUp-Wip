/**
 * Energya Cables - Factory Machines Fleet (83 Production Lines)
 */
export const MACHINE_MAP = {
  1: "DR01", 2: "DR02", 3: "DR03", 4: "DR04", 5: "DR05", 6: "DR06", 7: "DR07",
  9: "RS01", 10: "RS02", 11: "RS03", 12: "RS04", 13: "RS05", 14: "RS06",
  15: "CS01", 16: "CS02", 17: "DS01", 18: "CN01", 19: "TN01",
  20: "EX01", 21: "EX02", 22: "EX03", 23: "EX04", 24: "EX05", 25: "EX06", 26: "EX07", 27: "EX08", 28: "EX09", 29: "EX010", 30: "EX011", 31: "EX012", 32: "EX13", 33: "EX14",
  34: "CCV01", 35: "CCV02", 36: "CCV03", 37: "CCV04", 38: "CCV05",
  39: "CT01", 40: "CT02", 41: "CT03",
  42: "CW01", 43: "CW02", 44: "CW03",
  45: "DT01", 46: "DT02", 47: "DT03", 48: "DT04", 49: "DT2000", 50: "DT2001", 51: "DT2500", 52: "DT1600",
  53: "SR01", 54: "PR01", 55: "BT01", 56: "SZ01",
  57: "ST01", 58: "ST02", 59: "ST03", 60: "ST04",
  61: "BN01", 62: "BN02", 63: "BN03", 64: "BN04", 65: "BN05", 66: "BN06", 67: "BN07", 68: "BN08",
  69: "CO01", 70: "CO02", 71: "CO03", 72: "CO04", 73: "CO05",
  74: "RW01", 75: "RW02", 76: "RW03", 77: "RW04",
  78: "SingleTwist"
};

export function getMachineName(id) {
  return MACHINE_MAP[id] || `ماكينة ${id}`;
}
