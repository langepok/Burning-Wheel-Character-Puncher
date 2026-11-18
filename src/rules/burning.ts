import type { LifepathProgress } from './lifepaths';
import type { SkillDefinition, FixedRoot } from '../data/skills';
import { generalSkillTranscriptionContent } from '../data/skills/general';
import { lifepathTopicSkills } from '../data/burning/topics';
import { humanAgePools, humanBurningLists } from '../data/burning/human';

export const statIds = ['will','perception','agility','speed','power','forte'] as const;
export type StatId = typeof statIds[number];
export type Shade = 'B' | 'G' | 'W';
export type Pool = 'ordinary' | 'general';
export type Ability = { exponent: number; shade: Shade };
export interface Purchase { skillId: string; pool: Pool; cost: number; kind: 'open' | 'advance'; shade: 'root' | Shade; override: boolean }
export interface Sheet {
  stats: Record<StatId, Ability>;
  choices: Record<string, string>;
  candidates: string[];
  purchases: Purchase[];
  grayApproved: boolean;
}
export const skills = new Map([...generalSkillTranscriptionContent.skills,...lifepathTopicSkills].filter((s): s is SkillDefinition=>s.coverage==='complete').map(s=>[s.id,s]));
export const skillName = (id:string) => skills.get(id)?.sourceName ?? id.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
export function rootAbilities(skill:SkillDefinition): FixedRoot {
  return skill.rootRule.kind==='conditional' ? skill.rootRule.cases.find(c=>c.stockIds.includes('human'))?.root ?? skill.rootRule.otherwise : skill.rootRule;
}
export function skillOpening(skill:SkillDefinition, sheet:Sheet): Ability | undefined {
  const root=rootAbilities(skill);
  const refs=root.kind==='single' ? [root.ability] : root.abilities;
  if(refs.some(r=>r.kind!=='stat' || !statIds.includes(r.id as StatId))) return undefined;
  const values=refs.map(r=>sheet.stats[r.id as StatId]);
  if(values.some(a=>a.exponent<1)) return undefined;
  const order:Shade[]=['B','G','W'];
  const shade=order[Math.min(...values.map(v=>order.indexOf(v.shade)))];
  const mixed=new Set(values.map(v=>v.shade)).size>1;
  return {exponent:Math.floor((values.reduce((n,v)=>n+v.exponent,0)+(mixed?2:0))/(values.length*2)),shade};
}
export function skillValue(id:string,sheet:Sheet): Ability | 'training' | undefined {
  const skill=skills.get(id);const paid=sheet.purchases.filter(p=>p.skillId===id); const open=paid.find(p=>p.kind==='open');
  if(!skill || !open) return undefined;
  if(skill.training.kind==='training') return 'training';
  const root=skillOpening(skill,sheet); if(!root) return undefined;
  return {exponent:root.exponent+paid.filter(p=>p.kind==='advance').length,shade:open.shade==='root'?root.shade:open.shade};
}
export function deriveSheet(sheet:Sheet, progress:LifepathProgress) {
  const issues:string[]=[];
  const total={mental:0,physical:0,ordinary:0,general:0,traits:0,resources:0};
  const stockId=progress.paths[0]?.stockId;
  const age=stockId==='human'?humanAgePools.find(r=>progress.age>=r[0]&&progress.age<=r[1]):undefined;
  if(age){total.mental=age[2];total.physical=age[3];}
  else if(progress.paths.length) issues.push('No audited stat age table for this age or stock.');
  const available=new Set<string>();const required=new Set<string>();const requiredTraits=new Set<string>();
  const traits=new Set<string>();const choices:{key:string;label:string;options:readonly string[]}[]=[];
  const contributions:typeof total[]=[];
  const counts=new Map<string,number>();
  progress.paths.forEach((path,index)=>{
    const before={...total};
    const n=(counts.get(path.familyId)??0)+1;counts.set(path.familyId,n);
    const list=humanBurningLists[path.variantId];
    const factor=n<3?1:n===3?.5:0;
    total.ordinary+=Math.ceil(path.skillPointGrant.ordinary*factor);total.general+=Math.ceil(path.skillPointGrant.general*factor);
    total.resources+=Math.ceil((path.resourceGrant.kind==='fixed'?path.resourceGrant.amount:path.resourceGrant.base)*(n<3?1:.5));
    if(n<3) total.traits+=Math.max(0,path.traitPointGrant-(n===2&&list&&list.traits.length<2?1:0));
    if(n<3){
      const g=path.statGrant;
      if(g.kind==='mental'||g.kind==='physical')total[g.kind]+=g.amount;
      if(g.kind==='mentalAndPhysical'){total.mental+=g.mental;total.physical+=g.physical;}
      if(g.kind==='chooseMentalOrPhysical'){
        const key=`stat:${index}`;choices.push({key,label:path.sourceName+' · bonus pool',options:['mental','physical']});
        const choice=sheet.choices[key];if(choice==='mental'||choice==='physical')total[choice]+=g.amount;
        else issues.push(path.sourceName+': choose mental or physical bonus.');
      }
    }
    if(!list)issues.push(path.sourceName+': skill and trait lists await transcription; ordinary access is incomplete.');
    if(list){
      if(list.manual)issues.push(path.sourceName+': '+list.manual);
      const previousAvailable=new Set(available);
      const resolved=list.skills.map((slot,i)=>{
        if(typeof slot==='string')return slot;
        const key=`skill:${index}:${i}`; choices.push({key,label:path.sourceName+' · skill choice',options:slot});
        const selected=sheet.choices[key];if(selected&&slot.includes(selected))return selected;
        issues.push(path.sourceName+': select one of '+slot.map(skillName).join(' / ')+'.');return undefined;
      });
      resolved.forEach(id=>{if(id){available.add(id);if(!skills.has(id))issues.push(path.sourceName+': '+skillName(id)+' needs a topic/choice editor.');}});
      if(n<=3){const needed=resolved.slice(n-1).find(id=>id&&!required.has(id));if(needed){if(previousAvailable.has(needed)&&sheet.purchases.some(p=>p.skillId===needed))issues.push(path.sourceName+': if '+skillName(needed)+' was learned as an optional skill on a previous path, open the next unowned skill as well (BWGR 89; source allocation needs table review).');required.add(needed);}}
      list.traits.forEach(t=>traits.add(t));
      if(n<3){const t=list.traits.slice(n-1).find(t=>!requiredTraits.has(t));if(t)requiredTraits.add(t);}
    }
    contributions.push(Object.fromEntries(Object.entries(total).map(([key,value])=>[key,value-before[key as keyof typeof total]])) as typeof total);
  });
  const remaining={...total};
  for(const id of statIds){const v=sheet.stats[id];remaining[id==='will'||id==='perception'?'mental':'physical']-=v.exponent+(v.shade==='G'?5:0);
    if(progress.paths.length&&v.exponent<1)issues.push(skillName(id)+': allocate at least one point.');
    if(v.exponent>6)issues.push(skillName(id)+': exceeds default starting cap 6.');
    if(v.shade==='W')issues.push(skillName(id)+': white shade is a Free Creation override.');
    if(v.shade==='G'&&!sheet.grayApproved)issues.push(skillName(id)+': gray shade requires GM/group approval.');
  }
  for(const p of sheet.purchases)remaining[p.pool]-=p.cost;
  if(remaining.mental<0)issues.push('Mental pool overspent by '+-remaining.mental+'.');
  if(remaining.physical<0)issues.push('Physical pool overspent by '+-remaining.physical+'.');
  for(const pool of ['ordinary','general'] as const)if(remaining[pool]<0)issues.push(pool+' skill pool overspent by '+-remaining[pool]+'.');
  for(const id of required)if(!sheet.purchases.some(p=>p.skillId===id&&p.kind==='open'))issues.push('Required skill: '+skillName(id)+' is not open.');
  for(const id of new Set(sheet.purchases.map(p=>p.skillId))){
    const skill=skills.get(id)!;const paid=sheet.purchases.filter(p=>p.skillId===id);const open=paid.find(p=>p.kind==='open')!;
    if(paid.some(p=>p.pool==='ordinary')&&!available.has(id))issues.push(skill.sourceName+': no current lifepath access for ordinary spending.');
    if(open.pool==='general'&&paid.some(p=>p.kind==='advance'&&p.pool==='ordinary'))issues.push(skill.sourceName+': opened with General; advances must use General.');
    restrictionIssues(skill,sheet,stockId??'human').forEach(i=>issues.push(skill.sourceName+': '+i));
    const value=skillValue(id,sheet);
    if(!value)issues.push(skill.sourceName+': allocate its root stats.');
    if(value&&value!=='training'&&value.exponent>6)issues.push(skill.sourceName+': exceeds default starting cap 6.');
    if(open.shade==='G'&&!sheet.grayApproved)issues.push(skill.sourceName+': gray shade requires GM/group approval.');
    if(open.shade==='W')issues.push(skill.sourceName+': white shade is a Free Creation override.');
    if(paid.some(p=>p.override))issues.push(skill.sourceName+': purchased using Free Creation override; review before play.');
  }
  return {contributions,total,remaining,available,required,traits,requiredTraits,choices,issues:[...new Set(issues)]};
}
export function restrictionIssues(skill:SkillDefinition,sheet:Sheet,stockId='human'){
  const issues:string[]=[];
  if(skill.availabilityRestrictions.some(r=>!r.stockIds.includes(stockId)))issues.push('Unavailable to '+stockId+' during character burning.');
  for(const r of skill.openingRequirements)if(!sheet.purchases.some(p=>p.skillId===r.skillId&&p.kind==='open'))issues.push('Requires '+skillName(r.skillId)+'.');
  return issues;
}
