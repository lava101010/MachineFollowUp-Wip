/**
 * Energya Cables - WIP Data Ledger & Reel Traceability Engine
 * 
 * Rules:
 * 1. Physical reel lots are uniquely grouped by:
 *    (WorkOrder + StageID + NormalizedCard + (NormalizedReel if valid) + WireSize)
 * 2. Multi-shift runs for the same spool are merged (e.g. 10,620m in S1 + 4,070m in S2)
 * 3. Strict forward stage progression: consumer.StageID > producer.StageID
 * 4. Cross-order material transfer requires SendCardNo === ReceiveCardNo (Job Card) or Both.
 *    Reusable empty reels (e.g. L-36, G-90) NEVER match cross-order on Reel name alone.
 */

import { STAGE_MAP, getStageName, getStageEnglishName } from '../constants/stages.js';
import { getMachineName } from '../constants/machines.js';
import { getSupervisorName } from '../constants/supervisors.js';
import { normalizeCode } from '../utils/normalizer.js';
import { store } from '../state/store.js';

export function calculateWIPLedger() {
  const rawRecords = store.rawRecords;
  store.wipLedger = [];

  // 1. Group raw production records into unified physical WIP items.
  const producedGroups = [];
  const groupMap = new Map();

  rawRecords.forEach((r, idx) => {
    const orderId = r.OrderID || 'UNKNOWN';
    const stageId = r.StageID;
    const normCard = normalizeCode(r.ReceiveCardNo);
    const normReel = normalizeCode(r.TakeUpNo);
    const wireSize = r.WireSize || '16';

    let groupKey;
    if (normCard !== 'without') {
      // If Card is known: Card is the primary lot identifier on the shopfloor.
      const reelPart = normReel !== 'without' ? `__R_${normReel}` : '';
      groupKey = `${orderId}__S_${stageId}__C_${normCard}__W_${wireSize}${reelPart}`;
    } else if (normReel !== 'without') {
      // No Card, but Reel is known
      groupKey = `${orderId}__S_${stageId}__R_${normReel}__W_${wireSize}`;
    } else {
      // Neither Card nor Reel known: unique per row
      groupKey = `ROW_${idx}`;
    }

    if (!groupMap.has(groupKey)) {
      const newGrp = {
        key: groupKey,
        orderId: orderId,
        stageId: stageId,
        stageName: getStageName(stageId),
        wireSize: wireSize,
        conductor: r.ConductorMaterial || '',
        normCard: normCard,
        normReel: normReel,
        takeUpNo: r.TakeUpNo,
        receiveCardNo: r.ReceiveCardNo,
        sourcePayOff: r.PayOffNo,
        sourceSendCard: r.SendCardNo,
        originalLength: 0,
        records: [],
        recordIndices: [],
        machineNames: [],
        shiftCodes: [],
        supervisors: [],
        regDates: []
      };
      groupMap.set(groupKey, newGrp);
      producedGroups.push(newGrp);
    }

    const grp = groupMap.get(groupKey);
    grp.originalLength += (r.LengthMeters || 0);
    grp.records.push(r);
    grp.recordIndices.push(idx);

    const machName = getMachineName(r.MachineID);
    if (!grp.machineNames.includes(machName)) grp.machineNames.push(machName);
    if (!grp.shiftCodes.includes(r.ShiftCode)) grp.shiftCodes.push(r.ShiftCode);
    const supName = getSupervisorName(r.SupervisorID);
    if (!grp.supervisors.includes(supName)) grp.supervisors.push(supName);
    if (!grp.regDates.includes(r.RegDate)) grp.regDates.push(r.RegDate);

    // Preserve best display names (prefer hyphenated reel name like 'G-90' over 'G90')
    if (r.TakeUpNo !== 'without') {
      if (grp.takeUpNo === 'without' || (r.TakeUpNo.includes('-') && !grp.takeUpNo.includes('-'))) {
        grp.takeUpNo = r.TakeUpNo;
      }
    }
    if (r.ReceiveCardNo !== 'without' && grp.receiveCardNo === 'without') {
      grp.receiveCardNo = r.ReceiveCardNo;
    }
    if (r.PayOffNo !== 'without' && grp.sourcePayOff === 'without') {
      grp.sourcePayOff = r.PayOffNo;
    }
    if (r.SendCardNo !== 'without' && grp.sourceSendCard === 'without') {
      grp.sourceSendCard = r.SendCardNo;
    }
  });

  // 2. Pre-index raw records by order for strict within-order downstream lookups
  const recordsByOrder = {};
  rawRecords.forEach((rec, idx) => {
    const order = rec.OrderID || 'UNKNOWN';
    if (!recordsByOrder[order]) recordsByOrder[order] = [];
    recordsByOrder[order].push({ rec, idx });
  });

  // 3. Pre-index raw records for cross-order transfers using normalized keys
  const crossOrderMap = {};
  rawRecords.forEach((rec, idx) => {
    const pReel = normalizeCode(rec.PayOffNo);
    const sCard = normalizeCode(rec.SendCardNo);

    if (pReel !== 'without' && sCard !== 'without') {
      const bothKey = `${pReel}__${sCard}`;
      if (!crossOrderMap[bothKey]) crossOrderMap[bothKey] = [];
      crossOrderMap[bothKey].push({ rec, idx });
    }
    if (sCard !== 'without') {
      const cardKey = `CARD__${sCard}`;
      if (!crossOrderMap[cardKey]) crossOrderMap[cardKey] = [];
      crossOrderMap[cardKey].push({ rec, idx });
    }
  });

  // 4. Track consumption for each physical produced reel group
  producedGroups.forEach(grp => {
    let matchedConsumers = [];
    let seenIndices = new Set();

    // A. Check within the same WorkOrder:
    const orderCandidates = recordsByOrder[grp.orderId] || [];
    orderCandidates.forEach(({ rec: c, idx: cIdx }) => {
      if (grp.recordIndices.includes(cIdx)) return; // don't match self

      // Strict forward stage sequence: consumer stage MUST be strictly downstream
      if (c.StageID <= grp.stageId) return;

      const cPayOff = normalizeCode(c.PayOffNo);
      const cSendCard = normalizeCode(c.SendCardNo);

      let isMatch = false;
      // Priority 1: Match by normalized PayOffNo
      if (grp.normReel !== 'without' && cPayOff !== 'without') {
        if (cPayOff === grp.normReel) isMatch = true;
      }
      // Priority 2: Match by normalized SendCardNo
      else if (grp.normCard !== 'without' && cSendCard !== 'without') {
        if (cSendCard === grp.normCard) isMatch = true;
      }

      if (isMatch && !seenIndices.has(cIdx)) {
        seenIndices.add(cIdx);
        const consumedLen = (c.InputLengths && c.InputLengths > 0) ? c.InputLengths : (c.LengthMeters || 0);
        matchedConsumers.push({
          record: c,
          consumed: consumedLen,
          stage: getStageEnglishName(c.StageID),
          stageId: c.StageID,
          idx: cIdx
        });
      }
    });

    // B. If no consumers found in same WorkOrder, check cross-order transfer:
    if (matchedConsumers.length === 0) {
      let crossCandidates = [];
      // Priority 1: Match BOTH Reel & Card
      if (grp.normReel !== 'without' && grp.normCard !== 'without') {
        crossCandidates = crossOrderMap[`${grp.normReel}__${grp.normCard}`] || [];
      }
      // Priority 2: Match by Card (Job Card issuance across shopfloor orders)
      if (crossCandidates.length === 0 && grp.normCard !== 'without') {
        crossCandidates = crossOrderMap[`CARD__${grp.normCard}`] || [];
      }

      crossCandidates.forEach(({ rec: c, idx: cIdx }) => {
        if (c.OrderID !== grp.orderId && !seenIndices.has(cIdx)) {
          // Strict forward stage sequence: consumer stage MUST be strictly downstream
          if (c.StageID <= grp.stageId) return;

          seenIndices.add(cIdx);
          const consumedLen = (c.InputLengths && c.InputLengths > 0) ? c.InputLengths : (c.LengthMeters || 0);
          matchedConsumers.push({
            record: c,
            consumed: consumedLen,
            stage: `${getStageEnglishName(c.StageID)} [WO: ${c.OrderID}]`,
            stageId: c.StageID,
            idx: cIdx
          });
        }
      });
    }

    // C. Isolate DIRECT NEXT OPERATION only:
    if (matchedConsumers.length > 0) {
      matchedConsumers.sort((a, b) => a.stageId - b.stageId);
      const directStageId = matchedConsumers[0].stageId;
      matchedConsumers = matchedConsumers.filter(c => c.stageId === directStageId);
    }

    // D. Calculate Consumed and Remaining
    const rawConsumed = matchedConsumers.reduce((sum, c) => sum + c.consumed, 0);
    const totalConsumed = rawConsumed; // Show true recorded consumed meters
    const remaining = Math.max(0, grp.originalLength - rawConsumed); // Remaining balance cannot drop below 0

    // Identify consuming stages (English only, no Arabic)
    const consumingStages = matchedConsumers.length > 0
      ? Array.from(new Set(matchedConsumers.map(c => c.stage))).join(', ')
      : 'Not Drawn Yet';

    // Next expected stage in production flow
    const currentStageName = grp.stageName;
    const nextStageObj = STAGE_MAP[grp.stageId + 1];
    const nextStageName = nextStageObj ? getStageEnglishName(grp.stageId + 1) : 'Next Stage';

    // Source description
    let sourceDesc = '';
    if (grp.sourcePayOff !== 'without' && grp.sourceSendCard !== 'without') {
      sourceDesc = `بكرة: ${grp.sourcePayOff} (كارت: ${grp.sourceSendCard})`;
    } else if (grp.sourcePayOff !== 'without') {
      sourceDesc = `بكرة: ${grp.sourcePayOff}`;
    } else if (grp.sourceSendCard !== 'without') {
      sourceDesc = `كارت: ${grp.sourceSendCard}`;
    } else {
      sourceDesc = 'خامة أولية / بدون بكرة سابقة';
    }

    // Status Determination
    let statusCode = 'READY';
    let statusText = '';
    let statusBadgeClass = '';

    if (grp.originalLength <= 0) {
      statusCode = 'FULL';
      statusText = '0 م (بدون أطوال مسجلة)';
      statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200 font-semibold';
    } else if (remaining <= 0 || rawConsumed >= grp.originalLength) {
      statusCode = 'FULL';
      statusText = '🟢 مستهلكة بالكامل (رصيد 0 م)';
      statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
    } else if (totalConsumed > 0 && remaining > 0) {
      statusCode = 'PARTIAL';
      statusText = `🟡 متبقي ${Math.round(remaining).toLocaleString()} م (تم سحب جزء إلى: ${consumingStages})`;
      statusBadgeClass = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
    } else {
      statusCode = 'READY';
      statusText = `🔵 جاهزة بنسبة 100% (${Math.round(grp.originalLength).toLocaleString()} م) - لم تُسحب بعد`;
      statusBadgeClass = 'bg-blue-50 text-blue-900 border-blue-200 font-bold';
    }

    store.wipLedger.push({
      workOrder: grp.orderId,
      regDate: grp.regDates.join(' ، '),
      shiftCode: grp.shiftCodes.join(' + '),
      machineName: grp.machineNames.join('، '),
      supervisorName: grp.supervisors.join('، '),
      stageId: grp.stageId,
      stageName: currentStageName,
      wireSize: grp.wireSize,
      takeUpNo: grp.takeUpNo,
      receiveCardNo: grp.receiveCardNo,
      sourceDesc: sourceDesc,
      sourcePayOff: grp.sourcePayOff,
      sourceSendCard: grp.sourceSendCard,
      consumingStages: consumingStages,
      originalLength: grp.originalLength,
      totalConsumed: totalConsumed,
      remainingLength: remaining,
      statusCode: statusCode,
      statusText: statusText,
      statusBadgeClass: statusBadgeClass,
      mergedCount: grp.records.length,
      rawRecord: grp.records[0]
    });
  });

  // Update Header & Tab Badges
  const tabWipBadge = document.getElementById('tab-wip-count');
  if (tabWipBadge) tabWipBadge.innerText = store.wipLedger.length;
  const wipBadge = document.getElementById('wip-tab-badge');
  if (wipBadge) wipBadge.innerText = store.wipLedger.length;

  store.notify('WIP_CALCULATED');
}
