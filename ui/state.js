(function(root){
  'use strict';
  function validate(value,regions){
    if(!value||typeof value!=='object'||!Array.isArray(value.found)||!Array.isArray(value.pins)||!value.notes||typeof value.notes!=='object'||Array.isArray(value.notes))throw Error('Invalid progress format.');
    if(value.pins.length>5000||value.found.length>20000||Object.keys(value.notes).length>20000)throw Error('Too many saved entries.');
    const ids=new Set();
    for(const pin of value.pins){
      const region=pin&&regions.find(r=>r.id===pin.scene);
      if(!region||typeof pin.id!=='string'||!pin.id.startsWith('personal-')||ids.has(pin.id)||pin.category!=='personal'||typeof pin.name!=='string'||!pin.name.trim()||pin.name.length>100||!['x','y','z'].every(k=>Number.isFinite(pin[k])))throw Error('Invalid personal pin.');
      const b=region.bounds;
      if(pin.x<b.minX||pin.x>b.minX+b.sizeX||pin.z<b.minZ||pin.z>b.minZ+b.sizeZ)throw Error('Personal pin is outside its region.');
      ids.add(pin.id);
    }
    if(!value.found.every(id=>typeof id==='string')||!Object.values(value.notes).every(n=>typeof n==='string'&&n.length<=5000))throw Error('Invalid progress entries.');
    return {found:[...new Set(value.found)],pins:value.pins.map(p=>({...p})),notes:Object.fromEntries(Object.entries(value.notes))};
  }
  function recover(value,regions){
    const result={found:[],notes:{},pins:[]};
    if(!value||typeof value!=='object')return result;
    result.found=Array.isArray(value.found)?value.found.filter(id=>typeof id==='string').slice(0,20000):[];
    if(value.notes&&typeof value.notes==='object'&&!Array.isArray(value.notes))result.notes=Object.fromEntries(Object.entries(value.notes).filter(([id,n])=>typeof n==='string'&&n.length<=5000).slice(0,20000));
    const ids=new Set();
    for(const pin of (Array.isArray(value.pins)?value.pins:[]).slice(0,5000)){
      try{validate({found:[],notes:{},pins:[pin]},regions);if(!ids.has(pin.id)){result.pins.push(pin);ids.add(pin.id);}}catch{}
    }
    return result;
  }
  const api={validate,recover};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.AtlasState=api;
})(typeof window==='undefined'?globalThis:window);
