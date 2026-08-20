/**
 * IOCL Consumables & Store Management Portal
 * User Service
 *
 * Real API integration for normal user operations
 */

import { registerUser, loginNormalUser } from './authService';

export { registerUser, loginNormalUser };

export const userLogin = async (identifier, password) => {
  return loginNormalUser(identifier, password);
};
