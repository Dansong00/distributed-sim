import { expect, test, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createDiagram } from '../src/domain/templates';
import type { Diagram } from '../src/domain/model';

async function open(page: Page) {
  const doc = createDiagram('web', 'Reconnect');
  doc.nodes.push({id:'note',kind:'sticky',name:'Note',notes:'',description:'',position:{x:400,y:430},width:240,height:160,color:'yellow'});
  doc.edges = [{...doc.edges[0], id:'connection', label:'Profile request', comments:'Preserve this comment', stroke:'dashed', path:'curved', direction:'both'}];
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({name:'reconnect.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  return exported(page);
}
async function exported(page: Page): Promise<Diagram> {
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Diagram actions'}).click();
  await page.getByRole('button',{name:'Export JSON',exact:true}).click();
  return JSON.parse(await readFile((await (await pending).path())!,'utf8'));
}
async function select(page: Page) {
  // Keyboard selection also keeps this helper independent of the path's shape.
  const edge=page.locator('.react-flow__edge').first();
  await edge.focus();
  await page.keyboard.press('Enter');
  await expect(edge).toHaveClass(/selected/);
  await expect(edge.locator('.react-flow__edgeupdater')).toHaveCount(2);
}
async function center(locator: Locator) {
  const box=await locator.boundingBox();
  if(!box) throw new Error('Missing drag target');
  return {x:box.x+box.width/2,y:box.y+box.height/2};
}
async function drag(page: Page, end: 'source'|'target', target: Locator, cancel=false) {
  const from=await center(page.locator(`.react-flow__edgeupdater-${end}`));
  const to=await center(target);
  await page.mouse.move(from.x,from.y);
  await page.mouse.down();
  await page.mouse.move(to.x,to.y,{steps:12});
  if(cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
}
const handle=(page:Page,id:string,side:string)=>page.locator(`.react-flow__node[data-id="${id}"] .react-flow__handle[data-handleid="${side}"]`);

test('both endpoints can move, preserve properties, undo/redo, and survive reopening',async({page})=>{
  const doc=await open(page);
  await select(page);
  await drag(page,'target',handle(page,doc.nodes[2].id,'top'));
  const first={...doc.edges[0],target:doc.nodes[2].id,targetHandle:'top'};
  expect((await exported(page)).edges).toEqual([first]);
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  expect((await exported(page)).edges).toEqual(doc.edges);
  await page.getByRole('button',{name:'Redo',exact:true}).click();
  expect((await exported(page)).edges).toEqual([first]);
  await drag(page,'source',handle(page,doc.nodes[3].id,'right'));
  const second={...first,source:doc.nodes[3].id,sourceHandle:'right'};
  expect((await exported(page)).edges).toEqual([second]);
  await expect(page.getByRole('status')).toHaveText('Saved locally');
  await page.reload();
  await page.getByRole('button',{name:'Open Reconnect',exact:true}).click();
  expect((await exported(page)).edges).toEqual([second]);
  await select(page);
  await page.screenshot({path:'/tmp/reconnect-endpoints.png'});
});

test('invalid drops, Escape over a valid handle, and unchanged drops preserve the connection',async({page})=>{
  const doc=await open(page);
  await select(page);
  await drag(page,'target',page.getByRole('button',{name:'Clean up',exact:true}));
  expect((await exported(page)).edges).toEqual(doc.edges);
  await drag(page,'target',handle(page,doc.nodes[2].id,'top'),true);
  expect((await exported(page)).edges).toEqual(doc.edges);
  await select(page);
  await drag(page,'target',handle(page,doc.nodes[1].id,'left'));
  expect((await exported(page)).edges).toEqual(doc.edges);
  await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  // A fresh drag still works after cancellation, including changing sides on the same node.
  await drag(page,'target',handle(page,doc.nodes[1].id,'bottom'));
  expect((await exported(page)).edges).toEqual([{...doc.edges[0],targetHandle:'bottom'}]);
});

test('Escape before the first movement cancels the whole endpoint gesture',async({page})=>{
  const doc=await open(page);
  await select(page);
  const from=await center(page.locator('.react-flow__edgeupdater-target'));
  const to=await center(handle(page,doc.nodes[2].id,'top'));
  await page.mouse.move(from.x,from.y);
  await page.mouse.down();
  await page.keyboard.press('Escape');
  await page.mouse.move(to.x,to.y,{steps:12});
  await page.mouse.up();
  expect((await exported(page)).edges).toEqual(doc.edges);
  await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  await select(page);
  await drag(page,'target',handle(page,doc.nodes[2].id,'top'));
  expect((await exported(page)).edges).toEqual([{...doc.edges[0],target:doc.nodes[2].id,targetHandle:'top'}]);
});
