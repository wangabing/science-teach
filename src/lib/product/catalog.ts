export function normalizeSearch(value:string){return value.normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/g,' ').trim();}
export function matchesCatalog(text:string,entrySpace:string,entryGoal:string,query:{q:string;space:string;goal:string}){
 return (!query.space||entrySpace===query.space)&&(!query.goal||entryGoal===query.goal)&&normalizeSearch(query.q).split(' ').filter(Boolean).every(term=>normalizeSearch(text).includes(term));
}
