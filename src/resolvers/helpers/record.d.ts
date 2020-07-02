import { ObjectTypeComposerArgumentConfigMapDefinition, ObjectTypeComposer } from 'graphql-compose';

export type RecordHelperArgsOpts = {
  recordTypeName?: string;
  isRequired?: boolean;
  removeFields?: string[];
  requiredFields?: string[];
  /** Make all fields nullable by default. May be overridden by `requiredFields` property */
  allFieldsNullable?: boolean;
};

export function getRecordHelperArgsOptsMap(): Partial<
  Record<keyof RecordHelperArgsOpts, string | string[]>
>;

export type RecordHelperArgs<TSource> = { record: TSource };
export type RecordsHelperArgs<TSource> = { records: TSource[] };

export function recordHelperArgs(
  tc: ObjectTypeComposer<any>,
  opts?: RecordHelperArgsOpts
): ObjectTypeComposerArgumentConfigMapDefinition;
