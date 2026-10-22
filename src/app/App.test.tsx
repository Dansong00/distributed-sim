// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { useImperativeHandle } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { createDiagramStore } from '../storage/diagram-store';
import type { Diagram } from '../domain/model';
const layout = vi.hoisted(()=>({jobs:[] as {document:Diagram,resolve:(v:Diagram)=>void,cancel:ReturnType<typeof vi.fn>}[], props:null as any, fit:vi.fn(), setViewport:vi.fn()}));
vi.mock('../editor/layout/layout-job',()=>({startLayout:(document:Diagram)=>{
 let resolve!:(v:Diagram)=>void; const result=new Promise<Diagram>(r=>{resolve=r;});const cancel=vi.fn();
 layout.jobs.push({document,resolve,cancel});return {result,cancel};
}}));
vi.mock('../editor/Canvas',()=>({Canvas:(props:any)=>{
 layout.props=props;
 useImperativeHandle(props.ref,()=>({add:()=>props.dispatch({type:'preview',document:{...props.document,name:'Injected'}}),fit:layout.fit,setViewport:layout.setViewport}));
 return <div aria-label="Test canvas">{props.document.nodes[0]?.position.x}<button onClick={()=>props.onPreviewViewport?.({x:200,y:300,zoom:.6})}>Inspect viewport</button></div>;
}}));
const store=createDiagramStore();
afterEach(async()=>{cleanup();for(const r of await store.list())await store.remove(r.document.id,r.revision);layout.jobs=[];vi.clearAllMocks();});
async function open(){
 render(<App/>);
 await screen.findByRole('heading',{name:'Create a diagram'});
 fireEvent.change(screen.getByLabelText('Diagram name'),{target:{value:'Cleanup integration'}});
 fireEvent.change(screen.getByLabelText('Starter'),{target:{value:'web'}});
 fireEvent.click(screen.getByRole('button',{name:'Create diagram'}));
 await screen.findByRole('toolbar',{name:'Canvas tools'});
}
const candidateFor=(document:Diagram)=>({...structuredClone(document),nodes:document.nodes.map(n=>({...n,position:{x:n.position.x+400,y:n.position.y+100}}))});
test('preview stays out of IndexedDB/export/history and Cancel restores viewport and focus',async()=>{
 await open(); const original=(await store.list())[0];
 fireEvent.click(screen.getByRole('button',{name:'Clean up'}));
 await screen.findByText('Arranging…');expect(screen.getByRole('button',{name:'Export JSON'}).hasAttribute('disabled')).toBe(true);
 await waitFor(()=>expect(layout.jobs).toHaveLength(1));const job=layout.jobs[0];const candidate=candidateFor(job.document);
 await act(async()=>{job.resolve(candidate);});
 await screen.findByRole('button',{name:'Apply'});expect(layout.props.readOnly).toBe(true);expect(window.document.querySelector('.palette')?.hasAttribute('inert')).toBe(true);expect(window.document.querySelector('.inspector')?.hasAttribute('inert')).toBe(true);expect(layout.props.document.nodes).toEqual(candidate.nodes);expect(layout.fit).toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Inspect viewport'}));
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,450));});
 expect((await store.get(original.document.id))?.document.nodes).toEqual(original.document.nodes);
 expect(screen.getByRole('button',{name:'Undo'}).hasAttribute('disabled')).toBe(true);
 fireEvent.keyDown(window,{key:'Escape'});
 await waitFor(()=>expect(layout.props.readOnly).toBe(false));
 expect(layout.props.document.nodes).toEqual(original.document.nodes);expect(layout.setViewport).toHaveBeenCalledWith(original.document.viewport);
 await waitFor(()=>expect(window.document.activeElement).toBe(screen.getByRole('button',{name:'Clean up'})));
 expect((await store.get(original.document.id))?.revision).toBe(original.revision);
});
test('Apply commits one undo step and keeps the inspected viewport',async()=>{
 await open();const original=(await store.list())[0];
 fireEvent.click(screen.getByRole('button',{name:'Clean up'}));await screen.findByText('Arranging…');
 await waitFor(()=>expect(layout.jobs).toHaveLength(1));const job=layout.jobs[0]; const candidate=candidateFor(job.document);await act(async()=>job.resolve(candidate));
 fireEvent.click(screen.getByRole('button',{name:'Inspect viewport'}));fireEvent.click(screen.getByRole('button',{name:'Apply'}));
 await waitFor(()=>expect(layout.props.readOnly).toBe(false));expect(layout.props.document.nodes).toEqual(candidate.nodes);
 expect(layout.props.document.viewport).toEqual({x:200,y:300,zoom:.6});
 fireEvent.click(screen.getByRole('button',{name:'Undo'}));expect(layout.props.document.nodes).toEqual(original.document.nodes);
 expect(layout.props.document.viewport).toEqual({x:200,y:300,zoom:.6});
 fireEvent.click(screen.getByRole('button',{name:'Redo'}));expect(layout.props.document.nodes).toEqual(candidate.nodes);
});
test('stored remote changes reject Apply and leave original available through conflict recovery',async()=>{
 await open();const original=(await store.list())[0];
 fireEvent.click(screen.getByRole('button',{name:'Clean up'}));await screen.findByText('Arranging…');
 await waitFor(()=>expect(layout.jobs).toHaveLength(1));const job=layout.jobs[0];await act(async()=>job.resolve(candidateFor(job.document)));
 await store.save({...original.document,name:'Remote'},original.revision);
 fireEvent.click(screen.getByRole('button',{name:'Apply'}));
 await screen.findByText('This diagram changed in another tab.');
 await waitFor(()=>expect(layout.props.readOnly).toBe(false));
 expect(layout.props.document.nodes).toEqual(original.document.nodes);expect(layout.props.readOnly).toBe(false);
 expect(screen.getByRole('button',{name:'Save as copy'})).toBeTruthy();expect((await store.get(original.document.id))?.document.name).toBe('Remote');
});

test('Cancel during preparation invalidates the pending start and remains accessible',async()=>{
 await open();
 const original=(await store.list())[0];
 // A pending text save creates a real asynchronous prepare window.
 act(()=>{layout.props.onSelectionChange({nodeIds:[original.document.nodes[0].id],edgeIds:[]});});
 const name=screen.getByLabelText('Name');fireEvent.focus(name);fireEvent.change(name,{target:{value:'Text before cleanup'}});
 fireEvent.click(screen.getByRole('button',{name:'Clean up'}));
 expect(screen.getByRole('button',{name:'Cancel'}).closest('[inert]')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Clean up'}).hasAttribute('disabled')).toBe(false));
 expect(layout.jobs).toHaveLength(0);expect(layout.props.readOnly).toBe(false);
 expect((await store.get(original.document.id))?.document.nodes[0].name).toBe('Text before cleanup');
});
test('Clean up is disabled for an empty document',async()=>{
 render(<App/>);await screen.findByRole('heading',{name:'Create a diagram'});fireEvent.click(screen.getByRole('button',{name:'Create diagram'}));await screen.findByRole('toolbar');
 expect(screen.getByRole('button',{name:'Clean up'}).hasAttribute('disabled')).toBe(true);
});

test('Clean up is disabled throughout an active pointer gesture',async()=>{
 await open();act(()=>layout.props.onGestureChange(true));
 expect(screen.getByRole('button',{name:'Clean up'}).hasAttribute('disabled')).toBe(true);
 act(()=>layout.props.onGestureChange(false));
 expect(screen.getByRole('button',{name:'Clean up'}).hasAttribute('disabled')).toBe(false);
});
