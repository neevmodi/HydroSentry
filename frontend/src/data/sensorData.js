export const sensorData = [
  {
    id: 'NODE-001',
    location: 'Hillside Zone A',
    status: 'Online',

    rainfall: 62,
    waterLevel: 2.84,
    flowRate: 4.2,
    soilMoisture: 78,
    temperature: 28.4,
    humidity: 82,

    // ML inputs
    tiltDeg: 0.12,
    slopeAngle: 28,
    soilTypeCode: 2,
    historicalRiskScore: 0.42,

    lastUpdate: '12 sec ago',
  },

  {
    id: 'NODE-002',
    location: 'Valley Zone B',
    status: 'Warning',

    rainfall: 74,
    waterLevel: 3.21,
    flowRate: 5.8,
    soilMoisture: 86,
    temperature: 27.9,
    humidity: 88,

    // ML inputs
    tiltDeg: 0.24,
    slopeAngle: 34,
    soilTypeCode: 3,
    historicalRiskScore: 0.61,

    lastUpdate: '18 sec ago',
  },

  {
    id: 'NODE-003',
    location: 'River Zone C',
    status: 'Online',

    rainfall: 51,
    waterLevel: 2.41,
    flowRate: 3.6,
    soilMoisture: 71,
    temperature: 29.1,
    humidity: 79,

    // ML inputs
    tiltDeg: 0.08,
    slopeAngle: 22,
    soilTypeCode: 1,
    historicalRiskScore: 0.31,

    lastUpdate: '9 sec ago',
  },

  {
    id: 'NODE-004',
    location: 'Slope Zone D',
    status: 'Critical',

    rainfall: 91,
    waterLevel: 3.87,
    flowRate: 7.4,
    soilMoisture: 94,
    temperature: 26.8,
    humidity: 92,

    // ML inputs
    tiltDeg: 0.48,
    slopeAngle: 41,
    soilTypeCode: 3,
    historicalRiskScore: 0.82,

    lastUpdate: '6 sec ago',
  },
]