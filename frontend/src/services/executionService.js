/**
 * Cartridge Usage & Execution Service
 * Prepared for future Cartridge Consumption / Usage Backend APIs.
 */

export const getAssignedCallUpPOs = async () => {
  // Prepared for future GET /api/user/assigned-pos
  return {
    success: true,
    data: []
  };
};

export const getAssignedCallUpPOById = async (id) => {
  // Prepared for future GET /api/user/assigned-pos/:id
  return {
    success: true,
    data: null
  };
};

export const recordCartridgeUsage = async (payload) => {
  // Prepared for future POST /api/user/executions
  // Payload: { poId, cartridgeId, quantityExecuted, executionDate, remarks }
  return {
    success: true,
    message: 'Usage entry validated successfully.'
  };
};

export const getUsageHistory = async () => {
  // Prepared for future GET /api/user/executions
  return {
    success: true,
    data: []
  };
};
