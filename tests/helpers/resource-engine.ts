import { createCatalog } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { projectLifepathHistory } from '../../src/character/lifepath-history';
import type { ResourceConfiguration } from '../../src/character/resource-contracts';
export const catalog=createCatalog(humanContent);
export const progress=(...ids:string[])=>projectLifepathHistory({entries:ids.map(id=>({kind:'lifepath' as const,id,overrides:[]}))},catalog);
export const peasant=progress('human.peasant.born-peasant',...Array(8).fill('human.peasant.farmer'));
export const plain:ResourceConfiguration={kind:'plain',description:''};
export const request=(id:string,definition:string,configuration:ResourceConfiguration=plain)=>({id,definitionId:'human.resource.'+definition,configuration});
export const reviews=[{questionId:'arms-composition',explanation:'Reviewed idiom-appropriate equipment.'},{questionId:'property-threshold',explanation:'Table reviewed property eligibility and threshold.'},{questionId:'social-scope',explanation:'Distinct audiences/groups within the character’s Circles reviewed.'}];


export const wealthy=progress('human.city-dweller.city-born','human.villager.town-official',...Array(40).fill('human.peasant.head-of-household'));
export const social=(kind:'affiliation'|'reputation',dice:1|2|3=1,organizationId?:string):ResourceConfiguration=>({kind,dice,name:'Free name',description:'Free description',scope:'Local',audience:'People of Bree',...(organizationId?{organizationId}:{})});
export const relationship={kind:'relationship',name:'Friend',description:'Old friend',npcName:'Friend',significance:'minor',family:'none',romantic:false,forbidden:false,hateful:false,additionalConditions:''} satisfies ResourceConfiguration;
