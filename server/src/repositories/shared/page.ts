export enum OrderByKey {
  joinedAt = "joinedAt",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  version = "version",
}

export const buildDBPageQuery = <T extends Object>(
  where: Record<string, number>,
  key: OrderByKey,
  page: number,
  size: number,
  selector: T,
) => {
  const orderBy = [{ [key]: "desc" as const }, { id: "desc" as const }];

  return {
    where,
    orderBy,
    skip: page * size,
    take: size,
    select: selector,
  } as const;
};
