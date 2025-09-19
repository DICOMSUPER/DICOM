// export const nameKey = (schema: string, entity: string, identifier?: any) => {
//   return `petshop:${schema}:${entity}:${identifier}`;
// };

export interface CustomNameKeyParams {
  prefix:string
  schema: string;
  entity: string;
  id?: string;
  action?: string;
  params?: Record<string, any>;
}

export const customNameKey = (options: CustomNameKeyParams) => {
  const { prefix, schema, entity, id, action, params } = options;
  let keyPath = [prefix,schema, entity];
  console.log("keyPath:", keyPath);

  if (id) {
    keyPath.push(id);
  }

  if (action) {
    keyPath.push(action);
  }

  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null) 
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}_${v}`)
      .join('_');
    if (queryString) {
      keyPath.push(queryString);
    }
  }

  return keyPath.join(':');
};
