"use client"

import React, { ReactNode, useState } from "react";

type ColourTheme = {textCls:string, activeCls:string, hoverCls:string, bgCls:string};

export const Themes : {[x:string]:ColourTheme}= {
  RED:  {
    textCls:"text-red-400", activeCls:"active:text-red-300", 
    hoverCls:"hover:text-red-500 hover:bg-red-100",
    bgCls:"bg-red-100"},
  GREEN:{
    textCls:"text-green-400", activeCls:"active:text-green-300", 
    hoverCls:"hover:text-green-500 hover:bg-green-100",
    bgCls:"bg-green-100"
  },
  BLUE: {
    textCls:"text-blue-400", activeCls:"active:text-blue-300", 
    hoverCls:"hover:text-blue-500 hover:bg-blue-100",
    bgCls:"bg-blue-100"
  },
  GREY: {
    textCls:"text-gray-400", activeCls:"active:text-gray-300", 
    hoverCls:"hover:text-gray-500 hover:bg-gray-100",
    bgCls:"bg-gray-100"
  }
};

export function byId(id:string) {
  return document.getElementById(id);
} 

export function Button({ theme, children:content, className:extraClasses="", onClick:eCallBk, type="button"} : 
  {theme:ColourTheme, children?:ReactNode, onClick?:(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void, className?:string, type?:string}) {
  return (
    <button 
      type={type as ("submit" | "reset" | "button" | undefined)} 
      onClick={eCallBk}
      className={`${theme.textCls} ${theme.activeCls} ${theme.hoverCls} 
      cursor-pointer rounded-sm p-2 transition-colors justify-center grow flex items-center ${extraClasses}`}
    >
      {content}
    </button>
  );
}

export type KeyedTable = {
  key:any,
  eles:ReactNode[]
}[];
export function Lister(
{theme, colLayout:gtc, children, className:extraClasses="", className_c} : 
{theme:ColourTheme, colLayout?:string, children:KeyedTable, className?:string, className_c?:string}) {
  let items: ReactNode[] = [];
  for (let i=0; i<children.length; i++) {
    console.log(children[i].key);
    let cols = [];
    for (let j=0; j<children[i].eles.length; j++) {
      cols.push(
        <div key={j} className={className_c}>
          {children[i].eles[j]}
        </div>
      );
    }
    items.push(<div 
      key={children[i].key}
      className={`grid grid-cols-subgrid ${theme.textCls} ${theme.hoverCls} transition-colors duration-100`} 
      style={{gridColumn: `span ${children[0].eles.length}`}}>
      {cols}
    </div>);
  }
  return (
    <div 
      className={"w-full grid grid-cols-3 "+extraClasses} 
      style={{ gridTemplateColumns: gtc ?? `repeat(${children.length == 0 ? 0 : children[0].eles.length}, 1fr)` }}
    >
      {items}
    </div>
  )
}

type OptionElement = React.ReactElement<OptionProps>;
export function Select({theme:clrTheme, children, onChange} : 
  {theme:ColourTheme, children:OptionElement[]|OptionElement, onChange?:(n:ReactNode)=>any}) {
  function updateSearch() {
    
  }
  let processedChildren = [];
  if ((children as OptionElement[]).length == null) {
    children = [children] as OptionElement[];
  }
  children = children as OptionElement[];
  let options = [];
  for (let i=0; i<children.length; i++) {
    let node = children[i];
    options.push(node.props.children);
    processedChildren.push(
      <div 
        key={i} 
        className={`${clrTheme.textCls} ${clrTheme.activeCls} ${clrTheme.hoverCls} transition-colors cursor-pointer`}
        onClick={()=>{setSel(i); setActive(false);}}  
      >
        {node}
      </div>
    );
  }

  let [active, setActive] = useState<boolean>(false);
  let [sel, setSel] = useState<number>(-1);
  return (
    <form className={`${clrTheme.textCls} outline-blue-300`}>
      <input onInput={updateSearch} onClick={()=>{setActive(true)}} onBlur={()=>{setActive(false)}}
        className={`w-[100%] ${clrTheme.textCls} ${clrTheme.hoverCls} cursor-pointer transition-colors`}
        placeholder={sel >= 0 ? options[sel] : "Search..."}
      />
      <div className={
        `w-[100%] h-[fit-content] ${active ? "max-h-[100vh]" : "max-h-[0px]"} flex flex-col overflow-clip transition-all`}>
        {processedChildren}
      </div>
      <button className="hidden"/>
    </form>
  )
}

interface OptionProps {
  children: string
}
export function Option(props : OptionProps) {
  return <span>{props.children}</span>;
}

export function Loader(
  {theme, active=false} : 
  {theme:ColourTheme, active?:boolean}) {
  return (
    <div style={{transform:(active ? "" : "translateX(20px)")}} className="transition-transform">
      <svg className={(active ? "w-[20px] h-[20px] opacity-100 mr-2" : "w-[0px] opacity-0" )
        + " " + theme.textCls + " fill-current spinner size-5 transition-colors"} 
        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"></path>
      </svg>
    </div>
  )
}