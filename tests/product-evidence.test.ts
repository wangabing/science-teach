import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeDiscoveries,encodeDiscoveries,numericState,compareConditions} from '../src/lib/product/discoveries.ts';
import {matchesCatalog} from '../src/lib/product/catalog.ts';
import {experiments} from '../src/data/labs.ts';
import {curation,featuredSlugs} from '../src/data/curation.ts';
const valid=(v:unknown):v is Record<string,unknown>=>numericState({distance:{min:0,max:10,step:.1}},v);
test('saved evidence roundtrips conditions with writing and rejects a different experiment or model version',()=>{
 const row={conditions:{distance:1.2},prediction:'预测<&>',explanation:'观察到的证据'};
 const raw=encodeDiscoveries('demo',[row]);assert.deepEqual(decodeDiscoveries(raw,'demo',valid),[row]);
 assert.throws(()=>decodeDiscoveries(raw,'other',valid));
 for(const patch of [{modelVersion:2},{schemaVersion:2},{records:[row,row,row]},{records:[{...row,conditions:{distance:1.21}}]},{records:[{...row,explanation:'x'.repeat(2001)}]}])assert.throws(()=>decodeDiscoveries(JSON.stringify({...JSON.parse(raw),...patch}),'demo',valid));
});
test('untrusted storage cannot smuggle unknown fields, nonfinite, out-of-range or option values',()=>{
 for(const value of [{distance:Infinity},{distance:-.1},{distance:10.1},{distance:1,other:2},[],null])assert.equal(valid(value),false);
 assert.equal(numericState({mode:{min:0,max:4,options:[0,2,4]}},{mode:1}),false);
 assert.throws(()=>decodeDiscoveries('{invalid','demo',valid));
});
test('condition comparison distinguishes confounded changes from unchanged conditions',()=>{
 assert.match(compareConditions({a:1,b:2},{a:2,b:3},{a:'质量',b:'长度'}),/多个条件不同/);
 assert.match(compareConditions({a:1},{a:1}),/条件相同/);
});
test('catalog supports fullwidth case normalization, all terms and independent filters',()=>{
 assert.ok(matchesCatalog('凸透镜 放大镜 FOCUS','physics','concept',{q:'放大镜 ＦＯＣＵＳ',space:'physics',goal:'concept'}));
 assert.equal(matchesCatalog('凸透镜','physics','concept',{q:'凸透镜 月相',space:'',goal:''}),false);
 assert.equal(matchesCatalog('凸透镜','physics','concept',{q:'',space:'geometry',goal:''}),false);
});
test('curation references stable catalog identities and only four first recommendations',()=>{
 assert.equal(experiments.length,140);assert.equal(featuredSlugs.length,4);
 for(const [slug,guide] of Object.entries(curation)){assert.ok(experiments.some(e=>e.slug===slug));assert.ok(guide.model.check&&guide.model.location&&guide.transfer&&guide.views);}
 assert.equal(new Set(featuredSlugs.map(slug=>experiments.find(e=>e.slug===slug)!.space)).size,4);
});

test('all 140 entries have unique authored guidance, reachable targets and honest comparison labels',()=>{
 assert.equal(Object.keys(curation).length,140);
 for(const e of experiments){const g=curation[e.slug]!;assert.ok(g, e.slug);assert.match(g.target,/^#[a-z][\w-]*$/);assert.ok(g.synonyms.length&&g.first&&g.prerequisite&&g.prediction&&g.transfer&&g.views);assert.match(g.model.source,/^https:\/\//);}
 assert.equal(Object.values(curation).filter(g=>g.model.checkKind==='authored-comparison').length,118); // 120 shared minus two independently curated pilots
});
