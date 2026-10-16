/** One controllable animation, shared by explanatory demos, never by physics solvers. */
export function sequence(update:(progress:number)=>void,duration:number){
  let running=false,progress=0,last=0,frame=0;
  function pause(){running=false;cancelAnimationFrame(frame);}
  function loop(now:number){
    if(!running)return;
    progress=Math.min(1,progress+Math.min(now-last,100)/duration);last=now;update(progress);
    if(progress<1&&running)frame=requestAnimationFrame(loop);else pause();
  }
  function start(restart=false){if(restart)progress=0;pause();running=true;last=performance.now();update(progress);frame=requestAnimationFrame(loop);}
  function cancel(){pause();progress=0;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
  return {start,pause,cancel,isRunning:()=>running,progress:()=>progress};
}
