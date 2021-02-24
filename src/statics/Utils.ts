type GroupByResult<
  T extends Record<string | number, string | number | undefined>
> = Record<NonNullable<T[keyof T]>, T[]>;

export const groupBy = <
  T extends Record<string | number, string | number | undefined>
>(
  objs: T[],
  key: keyof T
): GroupByResult<T> => {
  return objs.reduce((acc, val) => {
    const prop = val[key] as NonNullable<T[keyof T]>;
    if (val[key]) {
      (acc[prop] = acc[prop] || []).push(val);
    }
    return acc;
  }, {} as GroupByResult<T>);
};
