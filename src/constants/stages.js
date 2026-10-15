/**
 * Energya Cables - Manufacturing Stage Mappings (22 Production Operations)
 */
export const STAGE_MAP = {
  1: { name: "Drawing", code: "DRW", ar: "سحب الأسلاك" },
  2: { name: "Stranding", code: "STD", ar: "تجديل الموصلات" },
  3: { name: "S.C TAPE", code: "SCT", ar: "شريط شبه موصل" },
  4: { name: "Buncher", code: "BN", ar: "تجميع وتجديل حزم" },
  5: { name: "Insulation", code: "INS", ar: "عزل البوليمر" },
  6: { name: "Insulation", code: "INS", ar: "عزل البوليمر" },
  7: { name: "Copper", code: "TAP", ar: "شريط نحاسي" },
  8: { name: "SCWB TAPE", code: "SCW", ar: "شريط شبه موصل مانع للمياه" },
  9: { name: "METALLIC SCREEN", code: "MSC", ar: "شيلد حماية معدني" },
  10: { name: "NCWB TAPE", code: "NCW", ar: "شريط عازل مانع للمياه" },
  11: { name: "Assembly", code: "ASM", ar: "تجميع الكابلات" },
  12: { name: "Bedding", code: "BED", ar: "تبطين داخلي" },
  13: { name: "LAMINTED ALMUNIUM TAPE", code: "LAT", ar: "شريط ألومنيوم مصفح" },
  14: { name: "Armouring", code: "ARM", ar: "تسليح الكابلات" },
  15: { name: "STEEL WIRE TAPE", code: "SWA", ar: "تسليح أسلاك فولاذية" },
  16: { name: "ALMENUM WIRE", code: "AWA", ar: "تسليح أسلاك ألومنيوم" },
  17: { name: "Sheathing", code: "SHE", ar: "غلاف نهائي خارجي" },
  18: { name: "Cooiling", code: "COI", ar: "لف وتعبئة كرتون" },
  19: { name: "REWIND", code: "RW", ar: "إعادة لف وفحص" },
  20: { name: "Mica", code: "MIC", ar: "شريط ميكا مقاوم للحريق" },
  21: { name: "STEEL TAPE ARM", code: "STA", ar: "تسليح شريط صلب" },
  22: { name: "Copper Tape", code: "CT", ar: "شريط نحاس تدريع" }
};

export function getStageName(id) {
  const s = STAGE_MAP[id];
  return s ? `${s.ar} (${s.code})` : `مرحلة ${id}`;
}

export function getStageEnglishName(id) {
  const s = STAGE_MAP[id];
  if (!s) return `Stage ${id}`;
  if (s.name.toUpperCase() === s.code.toUpperCase()) {
    return s.name;
  }
  return `${s.name} (${s.code})`;
}

