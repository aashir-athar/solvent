// Local id generator. Records never leave the device, so a simple time + random id is
// enough; no uuid dependency needed.
export function makeId(prefix = 'id'): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}
