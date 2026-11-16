import { describe, expect, it } from 'vitest';
import { createCatalog } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { applyLifepathCommand, projectLifepathHistory } from '../../src/character/lifepath-history';
import { createSheet, changeStat, buySkill, refundSkill, deriveSheet, parseDraft, encodeDraft, skillOpening, skills } from '../../src/character/workbench';
const catalog = createCatalog(humanContent);
import type { LifepathHistory } from '../../src/character/lifepath-history';
import type { Sheet } from '../../src/character/workbench';
const history = (...ids: string[]) => ids.reduce<LifepathHistory>((h, id) => applyLifepathCommand(h, {kind:'lifepath', id:'human.peasant.'+id}, 'rules', catalog), {entries: []});
const base = ():Sheet => ({ ...createSheet(), stats: {
  will:{exponent:3,shade:'B' as const}, perception:{exponent:3,shade:'B' as const},
  agility:{exponent:4,shade:'B' as const}, speed:{exponent:4,shade:'B' as const},
  power:{exponent:4,shade:'B' as const}, forte:{exponent:5,shade:'B' as const},
}});
const progress = (...ids:string[]) => projectLifepathHistory(history(...ids), catalog);
describe('workbench accounting', () => {
  it('derives age pools, repeat grants and never gives a third stat bonus', () => {
    const p=progress('born-peasant','farmer','farmer','farmer','farmer');
    const d=deriveSheet(base(),p);
    expect(d.total.ordinary).toBe(20); expect(d.total.general).toBe(3);
    expect(d.total.resources).toBe(19); expect(d.total.traits).toBe(3);
    expect(d.total.physical).toBe(15); // age 40:13, two +P grants
  });
  it('opens, advances across pools and refunds precisely in reverse', () => {
    const p=progress('born-peasant','farmer'); let s=base();
    s=buySkill(s,p,'farming','ordinary','rules').sheet;
    s=buySkill(s,p,'farming','general','rules').sheet;
    expect(deriveSheet(s,p).remaining).toMatchObject({ordinary:7,general:2});
    s=refundSkill(s,'farming');
    expect(deriveSheet(s,p).remaining).toMatchObject({ordinary:7,general:3});
    s=refundSkill(s,'farming');
    expect(deriveSheet(s,p).remaining).toMatchObject({ordinary:8,general:3});
    expect(deriveSheet(s,p).issues.some(x=>x.includes('Farming'))).toBe(true);
  });
  it('will not silently spend General or allow ordinary advances after General opening', () => {
    const p=progress('born-peasant','farmer');
    expect(buySkill(base(),p,'sword','ordinary','rules').error).toContain('General');
    const s=buySkill(base(),p,'farming','general','rules').sheet;
    expect(buySkill(s,p,'farming','ordinary','rules').error).toContain('opened with General');
  });
  it('Training costs two, has no exponent and cannot be advanced', () => {
    const p=progress('born-peasant','farmer');
    const s=buySkill(base(),p,'shield-training','general','rules').sheet;
    expect(deriveSheet(s,p).remaining.general).toBe(1);
    expect(buySkill(s,p,'shield-training','general','rules').error).toContain('Training');
    expect(deriveSheet(refundSkill(s,'shield-training'),p).remaining.general).toBe(3);
  });
  it('uses combined roots, darker shade and mixed-shade bonus', () => {
    const s=base(); s.stats.agility={exponent:5,shade:'G'};s.stats.perception={exponent:5,shade:'B'};
    expect(skillOpening(skills.get('surgery')!,s)).toEqual({exponent:3,shade:'B'});
  });
  it('retains paid cost when stats change and reports overspending without deleting purchases', () => {
    const p=progress('born-peasant','farmer');let s=buySkill(base(),p,'farming','ordinary','rules').sheet;
    s={...s,stats:{...s.stats,perception:{exponent:6,shade:'B'}}};
    expect(deriveSheet(s,p).issues.some(x=>x.includes('Mental'))).toBe(true);
    expect(deriveSheet(refundSkill(s,'farming'),p).remaining.ordinary).toBe(8);
  });
  it('enforces cap, stock restriction and known-skill prerequisites; free bypass keeps issues', () => {
    const p=progress('born-peasant','farmer');
    const s={...base(),stats:{...base().stats,will:{exponent:6,shade:'B' as const}}};
    expect(changeStat(s,p,'will',1,'rules').error).toBeTruthy();
    expect(buySkill(base(),p,'playwright','general','rules').error).toBeTruthy();
    const free=buySkill(base(),p,'playwright','general','free').sheet;
    expect(deriveSheet(free,p).issues.some(x=>x.includes('Write'))).toBe(true);
  });
  it('round trips drafts and rejects malformed or unknown data without applying it', () => {
    const draft={version:1 as const,name:'Mara',mode:'rules' as const,history:history('born-peasant','farmer'),sheet:base(),pins:['human.peasant.hunter']};
    expect(parseDraft(encodeDraft(draft),catalog)).toEqual(draft);
    expect(()=>parseDraft('{"version":99}',catalog)).toThrow();
    expect(()=>parseDraft(encodeDraft({...draft,sheet:{...base(),purchases:[{skillId:'fake',pool:'general',cost:-5,kind:'open',shade:'B'}]}} as never),catalog)).toThrow();
  });
});

it('enforces gray approval/cost and returns the full opening transaction',()=>{
 const p=progress('born-peasant','farmer');
 expect(buySkill(base(),p,'farming','ordinary','rules','G').error).toContain('approval');
 const s=buySkill({...base(),grayApproved:true},p,'farming','ordinary','rules','G').sheet;
 expect(deriveSheet(s,p).remaining.ordinary).toBe(3);
 expect(refundSkill(s,'farming').purchases).toEqual([]);
 expect(deriveSheet(refundSkill(s,'farming'),p).remaining.ordinary).toBe(8);
});
it('does not open above the default cap from a Free Creation root retained in Rules',()=>{
 const p=progress('born-peasant','farmer');const s=base();s.stats.perception.exponent=20;
 expect(buySkill(s,p,'farming','ordinary','rules').error).toContain('cap');
});
it('keeps purchases after source removal and explains their invalid ordinary access',()=>{
 const s=buySkill(base(),progress('born-peasant','farmer'),'farming','ordinary','rules').sheet;
 expect(deriveSheet(s,progress('born-peasant')).issues.join(' ')).toContain('no current lifepath access');
 expect(refundSkill(s,'farming').purchases).toEqual([]);
});
