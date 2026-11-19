export type TraitType = 'character' | 'call-on' | 'die' | 'die/call-on' | 'unresolved';
export type Access = 'lifepath' | 'common' | 'special' | 'general' | 'unresolved';
export type Coverage = 'matched' | 'index' | 'index-checked' | 'path';
export type Effect = 'play' | 'review' | 'manual' | 'automated' | 'unique';
export type TraitRow = [id:string, name:string, type:TraitType, price:number|null, pages:number[], coverage:Coverage, access:Access, stocks:string[], catalogAvailable:boolean, effect:Effect];
export interface Trait {
  id:string; name:string; type:TraitType; price:number|null; pages:number[]; coverage:Coverage;
  access:Access; stocks:string[]; catalogAvailable:boolean; effect:Effect; note?:string; requires?:string;
  maxPaths?:number; maxResources?:number; roundRoots?:string[];
  agePools?: {above:number; mental:number; physical:number};
}
export type PathSource = {kind:'lifepath'; path:string; occurrence:number};
export type TraitSource = PathSource | {kind:'catalog'} | {kind:'fey'} | {kind:'free'; points:number};
export interface TraitPurchase {id:string; source:TraitSource; cost:number; mode:'free'|'rules'}
