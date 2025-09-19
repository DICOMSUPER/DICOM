import { customNameKey } from './name-key.utils';

export const createCacheKey = {
  system: (
    entity: string,
    id?: string,
    action?: string,
    params?: Record<string, any>,
  ) => {
    return customNameKey({
      prefix: 'dicom',
      schema: 'system',
      entity,
      id,
      action,
      params,
    });
  },
  user: (
    entity: string,
    id?: string,
    action?: string,
    params?: Record<string, any>,
  ) => {
    return customNameKey({
      prefix: 'dicom',
      schema: 'user',
      entity,
      id,
      action,
      params,
    });
  },
  patient: (
    entity: string,
    id?: string,
    action?: string,
    params?: Record<string, any>,
  ) => {
    return customNameKey({
      prefix: 'dicom',
      schema: 'patient',
      entity,
      id,
      action,
      params,
    });
  },
};

