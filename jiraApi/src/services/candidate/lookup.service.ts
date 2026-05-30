import { issuetype, issuestatus, priority, project} from '../../db/schema';
import { user as userSchema } from '../../db/schema/user';
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';
import { db } from '../../config/db';

export const getIssueTypesService = async (): Promise<ServiceResponse> => {
  const data = await db.select().from(issuetype);
  return serviceResponse.success('DATA_FETCHED', data);
  
};

export const getIssueStatusesService = async (): Promise<ServiceResponse> => {
  const data = await db.select().from(issuestatus);
  return serviceResponse.success('DATA_FETCHED', data);
};

export const getPrioritiesService = async (): Promise<ServiceResponse> => {
  const data = await db.select().from(priority);
  return serviceResponse.success('DATA_FETCHED', data);
};

export const getUsersService = async (): Promise<ServiceResponse> => {
  const all = await db.select().from(userSchema);
  const data = all.map(({ passwordHash: _ph, ...u }) => u);
  return serviceResponse.success('DATA_FETCHED', data);
};

export const getProjectsService = async (): Promise<ServiceResponse> => {
  const data = await db.select().from(project);
  return serviceResponse.success('DATA_FETCHED', data);
};
