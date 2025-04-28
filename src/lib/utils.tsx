"use client"

import React, { ReactNode } from "react";

type ColourTheme = {textCls:string, activeCls:string, hoverCls:string};

export const Themes : {[x:string]:ColourTheme}= {
  RED:  {textCls:"text-red-400", activeCls:"active:text-red-300", hoverCls:"hover:text-red-500 hover:bg-red-100"},
  GREEN:{textCls:"text-green-400", activeCls:"active:text-green-300", hoverCls:"hover:text-green-500 hover:bg-green-100"},
  BLUE: {textCls:"text-blue-400", activeCls:"active:text-blue-300", hoverCls:"hover:text-blue-500 hover:bg-blue-100"},
  GREY: {textCls:"text-gray-400", activeCls:"active:text-gray-300", hoverCls:"hover:text-gray-500 hover:bg-gray-100"}
};

export function byId(id:string) {
  return document.getElementById(id);
} 

export function Button({ theme, children:content, className:extraClasses="", onClick:eCallBk, type="button"} : 
  {theme:ColourTheme, children:ReactNode, onClick?:(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void, className?:string, type?:string}) {
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


export function Loader(
  {theme, children, active=false} : 
  {theme:ColourTheme, children?:ReactNode, active?:boolean}) {
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