interface RequestParams {
  tableName: string;
}

export interface SelectParams extends RequestParams {
  query?: string[];
  where?: Record<string, unknown>;
}
export interface InsertParams<T> extends RequestParams {
  values: T[];
  returning?: string;
}

export interface DeleteParams extends RequestParams {
  where: Record<string, unknown>;
  returning?: string;
  cascade?: boolean;
}

export interface UpdateParams<UpdateType> extends RequestParams {
  where: Record<string, unknown>;
  updates: UpdateType & Record<string, unknown>;
  returning?: string;
}
