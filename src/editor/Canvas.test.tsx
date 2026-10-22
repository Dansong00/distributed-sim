// @vitest-environment jsdom
import { act, fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { createRef } from 'react';
import { Canvas, type CanvasHandle } from './Canvas';
import { createDiagram } from '../domain/templates';
const flow = vi.hoisted(() => ({props:{} as Record<string, any>, cancelConnection:vi.fn(), fitView:vi.fn(), setViewport:vi.fn(), getInternalNode:vi.fn(()=>({measured:{width:200,height:104}})), screenToFlowPosition:vi.fn(p=>p), getViewport:vi.fn(()=>({x:0,y:0,zoom:1}))}));
vi.mock('@xyflow/react',()=>({
 ReactFlowProvider:({children}:any)=>children, ReactFlow:(props:any)=>{flow.props=props;return <div>{props.children}</div>},
 useReactFlow:()=>flow, useStoreApi:()=>({getState:()=>({cancelConnection:flow.cancelConnection})}),
 Background:()=>null, Controls:()=>null, BackgroundVariant:{Dots:'dots'}, ConnectionMode:{Loose:'loose'},
 Position:{Top:'top',Right:'right',Bottom:'bottom',Left:'left'}, MarkerType:{ArrowClosed:'arrow'},
 Handle:()=>null, NodeResizer:()=>null,
}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
test('read-only canvas blocks mutation handlers, shortcuts, drops and imperative adds while preserving inspection',()=>{
 const document=createDiagram('notes','Preview'); const dispatch=vi.fn(()=>true), selection=vi.fn(), viewport=vi.fn(); const ref=createRef<CanvasHandle>();
 const {getByLabelText}=render(<Canvas ref={ref} document={document} readOnly onPreviewViewport={viewport} selection={{nodeIds:document.nodes.map(n=>n.id),edgeIds:[]}} tool="select" dispatch={dispatch} onSelectionChange={selection}/>);
 for(const key of ['Delete','Backspace','Escape','d','z','y','a']) fireEvent.keyDown(window,{key,ctrlKey:['d','z','y','a'].includes(key)});
 act(()=>{
  ref.current!.add('sticky');
  flow.props.onNodesChange([{type:'dimensions',id:document.nodes[0].id,dimensions:{width:999,height:999},resizing:true}]);
  flow.props.onNodeDragStart({}, {id:document.nodes[0].id,position:{x:0,y:0}});
  flow.props.onNodeDrag({}, {id:document.nodes[0].id,position:{x:90,y:90}},[]);
  flow.props.onNodeDragStop();
  flow.props.onConnect({source:document.nodes[0].id,target:document.nodes[1].id});
  flow.props.onMove(null,{x:90,y:100,zoom:.5});
 });
 fireEvent.drop(getByLabelText('Architecture canvas'),{dataTransfer:{getData:()=> 'sticky'}});
 expect(dispatch).not.toHaveBeenCalled(); expect(selection).not.toHaveBeenCalled(); expect(flow.cancelConnection).not.toHaveBeenCalled();
 expect(viewport).toHaveBeenCalledWith({x:90,y:100,zoom:.5});
 expect(flow.props.nodesDraggable).toBe(false); expect(flow.props.nodesConnectable).toBe(false); expect(flow.props.panOnDrag).toBe(true);
 expect(flow.props.nodes.every((n:any)=>!n.selected)).toBe(true);
 expect(flow.props.nodes[0].measured).toEqual({width:200,height:104});
 act(()=>{ref.current!.setViewport({x:5,y:8,zoom:1});ref.current!.fit();});
 expect(flow.setViewport).toHaveBeenCalledWith({x:5,y:8,zoom:1}); expect(flow.fitView).toHaveBeenCalled();
});
test('ordinary canvas editing and viewport persistence remain available',()=>{
 const document=createDiagram('web','Edit'); const dispatch=vi.fn(()=>true); const ref=createRef<CanvasHandle>();
 render(<Canvas ref={ref} document={document} selection={{nodeIds:[],edgeIds:[]}} tool="select" dispatch={dispatch} onSelectionChange={()=>{}}/>);
 act(()=>{ref.current!.add('sticky');flow.props.onMove(null,{x:10,y:20,zoom:1});});
 expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type:'preview'})); expect(dispatch).toHaveBeenCalledWith({type:'commit'});
 expect(dispatch).toHaveBeenCalledWith({type:'viewport',viewport:{x:10,y:20,zoom:1}});
});

test('preview toolbar buttons keep native Space activation',()=>{
 const document=createDiagram('web','Preview');
 const {getByRole}=render(<><button>Apply</button><Canvas document={document} readOnly selection={{nodeIds:[],edgeIds:[]}} tool="select" dispatch={()=>true} onSelectionChange={()=>{}}/></>);
 const event=new KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true});
 fireEvent(getByRole('button',{name:'Apply'}),event);
 expect(event.defaultPrevented).toBe(false);
});
