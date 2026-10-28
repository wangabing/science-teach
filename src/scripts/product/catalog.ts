import {matchesCatalog} from '../../lib/product/catalog';
const form=document.querySelector<HTMLFormElement>('[data-catalog-filter]');
if(form){
 const q=form.elements.namedItem('q') as HTMLInputElement,space=form.elements.namedItem('space') as HTMLSelectElement,goal=form.elements.namedItem('goal') as HTMLSelectElement;
 const entries=[...document.querySelectorAll<HTMLElement>('[data-catalog-entry]')];
 const count=document.querySelector<HTMLElement>('[data-result-count]')!,empty=document.querySelector<HTMLElement>('[data-no-results]')!;
 function render(){let found=0;for(const entry of entries){const match=matchesCatalog(entry.dataset.search??'',entry.dataset.space??'',entry.dataset.goal??'',{q:q.value,space:space.value,goal:goal.value});entry.hidden=!match;if(match)found++;}count.textContent=`找到 ${found} / ${entries.length} 个实验`;empty.hidden=found>0;}
 function fromURL(){const params=new URL(location.href).searchParams;q.value=params.get('q')??'';space.value=params.get('space')??'';goal.value=params.get('goal')??'';render();}
 function update(push:boolean){const url=new URL(location.href);for(const input of [q,space,goal]){if(input.value.trim())url.searchParams.set(input.name,input.value.trim());else url.searchParams.delete(input.name);}history[push?'pushState':'replaceState']({},'',url);render();}
 form.addEventListener('submit',event=>{event.preventDefault();update(true);});
 // Changes create history entries only on commit, preserving Back for previous filter choices.
 space.addEventListener('change',()=>update(true));goal.addEventListener('change',()=>update(true));
 document.querySelectorAll<HTMLButtonElement>('[data-clear-filters]').forEach(button=>button.addEventListener('click',()=>{form.reset();update(true);q.focus();}));
 window.addEventListener('popstate',fromURL);fromURL();form.dataset.ready='true';
}
