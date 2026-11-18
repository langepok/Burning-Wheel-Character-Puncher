import type { GameCatalog, LifepathDefinition, SettingDefinition } from '../data/catalog';

export interface MapPoint { readonly x: number; readonly y: number }
export interface MapRegion { readonly setting: SettingDefinition; readonly x: number; readonly y: number; readonly height: number; readonly paths: readonly LifepathDefinition[] }

/** Content-order layout. All coordinates are presentation metadata, never rules facts. */
export function layoutCatalog(catalog: GameCatalog, stockId: string) {
  const settings = [...catalog.settings.values()].filter(setting => setting.stockId === stockId);
  const loaded = settings.filter(setting => setting.coverage !== 'reference-only');
  const references = settings.filter(setting => setting.coverage === 'reference-only');
  const ordered = [...loaded, ...references];
  const regions: MapRegion[] = [];
  const points = new Map<string, MapPoint>();
  const columnBottoms = [24, 24];
  ordered.forEach((setting, index) => {
    const paths = [...catalog.lifepaths.values()].filter(path => path.settingId === setting.id);
    const column = index % 2;
    const x = 24 + column * 778;
    const y = columnBottoms[column]!;
    const height = paths.length ? 76 + Math.ceil(paths.length / 4) * 104 : 116;
    paths.forEach((path, pathIndex) => points.set(path.variantId, {
      x: x + 99 + (pathIndex % 4) * 184,
      y: y + 80 + Math.floor(pathIndex / 4) * 104,
    }));
    regions.push({ setting, x, y, height, paths });
    columnBottoms[column] = y + height + 24;
  });
  return { regions, points, width: 1580, height: Math.max(...columnBottoms) };
}

/** Route chronology only, never a prerequisite or eligibility edge. */
export function routeSegment(from:MapPoint,to:MapPoint,rail:number){
  if(from.x===to.x&&from.y===to.y)return `M ${from.x+86} ${from.y-12} C ${from.x+100} ${from.y-32}, ${from.x+100} ${from.y+32}, ${from.x+86} ${from.y+12}`;
  if(from.y===to.y){const sign=Math.sign(to.x-from.x);return Math.abs(to.x-from.x)===184?`M ${from.x+sign*86} ${from.y} H ${to.x-sign*86}`:`M ${from.x} ${from.y+42} V ${from.y+52} H ${to.x} V ${to.y+42}`;}
  const sign=Math.sign(to.y-from.y);
  if(from.x===to.x&&Math.abs(to.y-from.y)===104)return `M ${from.x} ${from.y+sign*42} V ${to.y-sign*42}`;
  return `M ${from.x} ${from.y+sign*42} V ${from.y+sign*52} H ${rail} V ${to.y-sign*52} H ${to.x} V ${to.y-sign*42}`;
}
