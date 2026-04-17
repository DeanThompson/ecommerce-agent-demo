export function toExclusiveEndDate(date: string): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  const next = new Date(base.getTime() + 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}
