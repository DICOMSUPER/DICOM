import { createHash } from 'crypto';
import { CacheEntity, CacheKeyPattern } from '../constant/cache';

export const cacheKeyBuilder = {
  id: (entity: CacheEntity, id: string) => {
    return `${entity}.${CacheKeyPattern.id}/${id}`;
  },

  findAll: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.all}`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  paginated: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.paginated}`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  filter: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.filter}`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  byReferenceId: (
    entity: CacheEntity,
    referenceId?: string,
    query?: object
  ) => {
    const basePattern = `${entity}.${CacheKeyPattern.byReferenceId}/${
      referenceId ? referenceId : ''
    }`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  filterWithPagination: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.filterWithPagination}`;
    const hashedQuery = hashQuery(query);
    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  statsInDateRange: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.statsInDateRange}`;
    const hashedQuery = hashQuery(query);
    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  byOrderId: (entity: CacheEntity, orderId: string) => {
    return `${entity}.${CacheKeyPattern.byOrderId}/${orderId}`;
  },

  byStudyId: (
    entity: CacheEntity,
    studyId?: string,
    signatureType?: string
  ) => {
    return `${entity}.${CacheKeyPattern.byStudyId}/${studyId ? studyId : ''}${
      signatureType ? `/${signatureType}` : ''
    }`;
  },

  bySeriesId: (entity: CacheEntity, seriesId?: string, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.bySeriesId}/${
      seriesId ? seriesId : ''
    }`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  byInstanceId: (entity: CacheEntity, instanceId?: string, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.byInstanceId}/${
      instanceId ? instanceId : ''
    }`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  stats: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.stats}`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  byPatientId: (entity: CacheEntity, patientId?: string, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.byPatientId}/${
      patientId ? patientId : ''
    }`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  roomStats: (entity: CacheEntity, id?: string) => {
    return `${entity}.${CacheKeyPattern.roomStats}/${id ? id : ''}`;
  },

  roomStats2: (entity: CacheEntity, id?: string) => {
    return `${entity}.${CacheKeyPattern.roomStats2}/${id ? id : ''}`;
  },

  filterByRoomId: (entity: CacheEntity, roomId?: string, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.filterByRoomId}/${
      roomId ? roomId : ''
    }`;
    const hashedQuery = hashQuery(query);

    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  roomStatsInDateRange: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.roomStatsInDateRange}`;
    const hashedQuery = hashQuery(query);
    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },

  byRoomId: (entity: CacheEntity, roomId?: string) => {
    return `${entity}.${CacheKeyPattern.byRoomId}/${roomId ? roomId : ''}`;
  },

  physicianStats: (entity: CacheEntity, query?: object) => {
    const basePattern = `${entity}.${CacheKeyPattern.receptionStats}`;
    const hashedQuery = hashQuery(query);
    return hashedQuery ? `${basePattern}?${hashedQuery}` : basePattern;
  },
};

// hash query for shorter key => better performance
export const hashQuery = (query: any): string => {
  if (!query || Object.keys(query).length === 0) {
    return ''; // means "no query"
  }

  const sortedKeys = Object.keys(query).sort();
  const keyValueString = sortedKeys
    .map((key) => `${key}=${query[key]}`)
    .join('&');

  return createHash('sha1').update(keyValueString).digest('hex');
};
