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
  const columnBottoms = [24, 24, 24];
  ordered.forEach((setting, index) => {
    const paths = [...catalog.lifepaths.values()].filter(path => path.settingId === setting.id);
    const column = index % 3;
    const x = 24 + column * 354;
    const y = columnBottoms[column]!;
    const height = paths.length ? 76 + Math.ceil(paths.length / 2) * 70 : 116;
    paths.forEach((path, pathIndex) => points.set(path.variantId, {
      x: x + 87 + (pathIndex % 2) * 156,
      y: y + 66 + Math.floor(pathIndex / 2) * 70,
    }));
    regions.push({ setting, x, y, height, paths });
    columnBottoms[column] = y + height + 24;
  });
  return { regions, points, width: 1090, height: Math.max(...columnBottoms) };
}
