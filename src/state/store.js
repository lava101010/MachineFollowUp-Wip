/**
 * Energya Cables - Centralized Reactive Application State Store
 */
export const store = {
  // Data Records
  rawRecords: [],
  filteredRecords: [],
  
  // Analytics & Stats
  machineStats: {},
  stageStats: {},
  
  // WIP & Traceability
  wipLedger: [],
  filteredWIP: [],
  
  // Active UI Selection & Modes
  selectedMachineId: null,
  current3DMode: 'status', // 'status' | 'heatmap' | 'material' | 'stage'
  chartUnitMode: 'km', // 'km' (default) | 'ton'
  animationsEnabled: true,
  is3DLoopRunning: true,
  animFrameId: null,
  
  // Pagination & Tabs
  tableCurrentPage: 1,
  tablePageSize: 15,
  wipCurrentPage: 1,
  wipPageSize: 15,
  currentTableSubTab: 'production',
  
  // 3D & Charts Instances
  charts: {},
  machineMeshes: {},
  animatedSpools: [],
  highlightRing: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  raycaster: null,
  mouse: null,

  // Event Listeners for State Updates
  _subscribers: new Set(),

  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  },

  notify(event, payload) {
    this._subscribers.forEach(fn => fn(event, payload));
  }
};
