export const groupBy = <T extends Record<string | number, string | number>>(
  objs: T[],
  key: keyof T
): Record<T[keyof T], T[]> => {
  return objs.reduce((acc: Record<T[keyof T], T[]>, val) => {
    (acc[val[key]] = acc[val[key]] || []).push(val);
    return acc;
  }, {} as Record<T[keyof T], T[]>);
};
