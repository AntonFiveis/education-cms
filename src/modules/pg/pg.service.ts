import { Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import {
  DeleteParams,
  InsertParams,
  SelectParams,
  UpdateParams,
} from './interfaces/queryParams.interface';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PgService {
  private pool: Pool = new Pool();

  async create<T>({
    tableName,
    values,
    returning,
  }: InsertParams<T>): Promise<QueryResult> {
    const columnNamesString = Object.keys(values[0])
      .map((key) => `"${key}"`)
      .join(',');

    let counter = 1;

    const requestValues = values.map((value) => Object.values(value)).flat(1);

    const request =
      'INSERT INTO "' +
      tableName +
      '" (' +
      columnNamesString +
      ') VALUES ' +
      values
        .map(
          (value) =>
            '(' +
            Object.values(value)
              .map(() => `$${counter++}`)
              .join(',') +
            ')',
        )
        .join(',') +
      (returning
        ? returning == '*'
          ? `RETURNING ${returning}`
          : `RETURNING "${returning}"`
        : '');
    try {
      return await this.pool.query(request, requestValues);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async find<T>(
    { query, tableName, where }: SelectParams,
    limit?: number,
  ): Promise<T[]> {
    const whereStatements = where
      ? 'WHERE ' +
        Object.keys(where)
          .map((key, index) => `"${key}"=$${index + 1}`)
          .join(' AND ')
      : '';
    const request =
      'SELECT ' +
      (query ? query.map((column) => `"${column}"`).join(',') : '*') +
      ` FROM "${tableName}" ` +
      whereStatements +
      (limit ? ` LIMIT ${limit} ` : '');
    try {
      // console.log(request, where)
      const res = await this.pool.query(
        request,
        where ? Object.values(where) : [],
      );
      return res.rows as T[];
    } catch (error) {
      return error;
    }
  }

  async findOne<T>(params: SelectParams): Promise<T> {
    const res = await this.find<T>(params, 1);
    return res[0];
  }

  async delete({
    tableName,
    where,
    returning,
    cascade,
  }: DeleteParams): Promise<QueryResult | undefined> {
    const request =
      `DELETE FROM "${tableName}" ` +
      (cascade ? 'CASCADE ' : '') +
      `WHERE ` +
      Object.keys(where)
        .map((key, index) => `"${key}"=$${index + 1}`)
        .join(' AND ') +
      (returning
        ? returning == '*'
          ? `RETURNING ${returning}`
          : `RETURNING "${returning}"`
        : '');
    try {
      return this.pool.query(request, Object.values(where));
    } catch (error) {
      console.log(error);
    }
  }

  async update<T>({
    tableName,
    updates,
    where,
    returning,
  }: UpdateParams<T>): Promise<QueryResult> {
    let counter = 1;
    const sets = Object.keys(updates)
      .filter((key) => updates[key] !== undefined)
      .map((key) => `"${key}"=$${counter++}`)
      .join(',');

    const whereStatements = Object.keys(where)
      .map((key) => `"${key}"=$${counter++}`)
      .join(' AND ');

    const request =
      `UPDATE "${tableName}" SET ${sets} WHERE ${whereStatements}` +
      (returning
        ? returning == '*'
          ? `Returning ${returning}`
          : `Returning "${returning}"`
        : '');
    try {
      return this.pool.query(request, [
        ...Object.values(updates),
        ...Object.values(where),
      ]);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  useQuery(request: string, values?: unknown[]): Promise<QueryResult> {
    return this.pool.query(request, values);
  }
}
