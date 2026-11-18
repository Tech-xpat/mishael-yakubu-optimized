// Run: npx tsx scripts/assistant-fuzz.mts   (misspells the test questions at random and checks they still work)
import { answer } from '../src/lib/assistant.ts';
import { CASES } from './assistant-test.mts';
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const corrupt = (w: string) => {
  const i = 1 + Math.floor(rnd() * (w.length - 1));
  switch (Math.floor(rnd() * 6)) {
    case 0: return w.slice(0, i) + w.slice(i + 1);                       // drop a letter
    case 1: return i < w.length - 1 ? w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2) : w; // swap
    case 2: return w.slice(0, i) + w[i] + w.slice(i);                    // double a letter
    case 3: return w.slice(0, i) + 'aeiou'[Math.floor(rnd() * 5)] + w.slice(i + 1); // wrong letter
    case 4: return w[0] + w.slice(1).replace(/[aeiou]/g, '');           // drop vowels
    default: return w.slice(0, i) + 'qwertyuiopasdfghjklzxcvbnm'[Math.floor(rnd() * 26)] + w.slice(i); // extra letter
  }
};
const cases = CASES;
const clean = cases.filter(([q,e]) => e.length && !['greet','ack','wellbeing','bye'].includes(e[0]) && answer(q,{folders:[]}).topics?.length && e.every(t=>answer(q,{folders:[]}).topics!.includes(t)));
let total=0, ok=0; const bad: string[] = [];
for (const [q,exp] of clean) {
  for (let k=0;k<6;k++) {
    const ws = q.split(' '); const idx = ws.map((w,i)=>[w,i] as const).filter(([w])=>w.replace(/\W/g,'').length>=5).map(([,i])=>i);
    if (!idx.length) continue;
    const n = rnd()<0.4 ? 2 : 1;
    for (let m=0;m<n;m++){ const i=pick(idx); ws[i]=corrupt(ws[i]); }
    const mq = ws.join(' '); total++;
    const got = answer(mq,{folders:[]}).topics ?? [];
    if (exp.every(e=>got.includes(e))) ok++; else if (bad.length<40) bad.push(`${JSON.stringify(mq)}  want ${exp}  got ${got}`);
  }
}
console.log(`clean cases ${clean.length}; typo variants ${ok}/${total} = ${(100*ok/total).toFixed(1)}%`);
console.log(bad.join('\n'));
process.exit(ok / total >= 0.9 ? 0 : 1);
