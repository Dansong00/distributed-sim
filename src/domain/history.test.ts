import { expect, it } from 'vitest';
import type { Diagram } from './model';
import { createHistory, historyReducer } from './history';
const doc: Diagram={schemaVersion:1,id:'d',name:'start',createdAt:'',updatedAt:'',nodes:[],edges:[],viewport:{x:0,y:0,zoom:1}};
it('coalesces 30 previews into one undoable transaction',()=>{
 let state=historyReducer(createHistory(doc),{type:'begin'});
 for(let n=0;n<30;n++) state=historyReducer(state,{type:'preview',document:{...doc,name:String(n)}});
 state=historyReducer(state,{type:'commit'});
 expect(state.past).toHaveLength(1);
 expect(historyReducer(state,{type:'undo'}).present).toEqual(doc);
 expect(historyReducer(historyReducer(state,{type:'undo'}),{type:'redo'}).present.name).toBe('29');
});
it('cancels without history and preserves current viewport on cancel and undo',()=>{
 let state=historyReducer(createHistory(doc),{type:'begin'});
 state=historyReducer(state,{type:'preview',document:{...doc,name:'changed'}});
 state=historyReducer(state,{type:'viewport',viewport:{x:30,y:40,zoom:2}});
 const canceled=historyReducer(state,{type:'cancel'});
 expect(canceled.past).toHaveLength(0); expect(canceled.present.name).toBe('start'); expect(canceled.present.viewport.x).toBe(30);
 const committed=historyReducer(state,{type:'commit'});
 expect(historyReducer(committed,{type:'undo'}).present.viewport).toEqual({x:30,y:40,zoom:2});
});
it('bounds history, clears redo on edits and resets on replace',()=>{
 let state=createHistory(doc);
 for(let n=0;n<101;n++) { state=historyReducer(state,{type:'begin'}); state=historyReducer(state,{type:'preview',document:{...doc,name:String(n)}}); state=historyReducer(state,{type:'commit'}); }
 expect(state.past).toHaveLength(100);
 state=historyReducer(state,{type:'undo'}); expect(state.future).toHaveLength(1);
 state=historyReducer(state,{type:'begin'}); state=historyReducer(state,{type:'preview',document:{...doc,name:'new'}}); state=historyReducer(state,{type:'commit'}); expect(state.future).toHaveLength(0);
 state=historyReducer(state,{type:'replace',document:doc}); expect(state).toEqual(createHistory(doc));
 expect(historyReducer(state,{type:'viewport',viewport:{x:1,y:2,zoom:1}}).past).toHaveLength(0);
});
it('does not commit unchanged or viewport-only transactions',()=>{
 let state=historyReducer(createHistory(doc),{type:'begin'});
 state=historyReducer(state,{type:'viewport',viewport:{x:1,y:2,zoom:1}});
 expect(historyReducer(state,{type:'commit'}).past).toHaveLength(0);
});
