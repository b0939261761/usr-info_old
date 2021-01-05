import request from '../utils/request.js';

process.env.UFOP_TOKEN = 'hPSmNnIa2xHL48Q2lXRxMC55kQwD5OWo';
process.env.UFOP_BASE_URL = 'http://159.69.200.205:3001/organizations/';

const baseUrl = process.env.UFOP_BASE_URL;
const baseHeaders = { Token: process.env.UFOP_TOKEN };

export const lastOrganization = async () => {
  const organization = await request(`${baseUrl}lastOrganization`, { headers: baseHeaders });
  organization.stayInformation = organization.status;
  return organization;
};

export const isNewUsrInfo = code => {
  const headers = {
    ...baseHeaders,
    'Content-Type': 'application/json'
  };

  const body = { code };
  return request(`${baseUrl}isNewUsrInfo`, { method: 'POST', headers, body });
};

export default {
  lastOrganization,
  isNewUsrInfo
};
