"use client"

import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";
import React, { ReactNode, useEffect, useState } from "react";

type ColourTheme = {textCls:string, activeCls:string, hoverCls:string, bgCls:string, bg2:string};

export const Themes : {[x:string]:ColourTheme}= {
  RED:  {
    textCls:"text-red-400", activeCls:"active:text-red-300", 
    hoverCls:"hover:text-red-500 hover:bg-red-200",
    bgCls:"bg-red-100", bg2:"bg-red-50" },
  GREEN:{
    textCls:"text-green-400", activeCls:"active:text-green-300", 
    hoverCls:"hover:text-green-500 hover:bg-green-200",
    bgCls:"bg-green-100", bg2:"bg-green-50"
  },
  BLUE: {
    textCls:"text-blue-400", activeCls:"active:text-blue-300", 
    hoverCls:"hover:text-blue-500 hover:bg-blue-200",
    bgCls:"bg-blue-100", bg2:"bg-blue-50"
  },
  GREY: {
    textCls:"text-gray-400", activeCls:"active:text-gray-300", 
    hoverCls:"hover:text-gray-500 hover:bg-gray-200",
    bgCls:"bg-gray-100", bg2:"bg-gray-50"
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
      className={`${extraClasses} ${theme.textCls} ${theme.activeCls} ${theme.hoverCls} 
      cursor-pointer rounded-sm p-2 transition-colors justify-center grow flex items-center `}
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
export function Select({theme:clrTheme, children, className, onChange} : 
  {theme:ColourTheme, children:OptionElement[]|OptionElement, className?:string, onChange?:(n:ReactNode)=>any}) {
  let [filter, setFilter] = useState<string>("");
  let [active, setActive] = useState<boolean>(false);
  let [sel, setSel] = useState<number>(-1);
  let [inputReady, setInputReady] = useState<boolean>(false);

  let processedChildren = [];
  if ((children as OptionElement[]).length == null) {
    children = [children] as OptionElement[];
  }
  children = children as OptionElement[];
  let options = [];
  for (let i=0; i<children.length; i++) {
    console.log("searching", filter);
    let node = children[i];
    options.push(node.props.children);
    let regex = new RegExp("("+filter+")", "i")
    let matched = null;
    if (filter != "") matched = node.props.children.match(regex);
    // if active and (search produces something or no search)
    if (active && (filter != "" && matched || filter == "")) {
      let foundIdx = node.props.children.search(regex);
      console.log(foundIdx);
      processedChildren.push(
        <div 
          key={JSON.stringify({idx:i, value:node.props.value})} 
          className={`${clrTheme.textCls} ${clrTheme.activeCls} ${clrTheme.hoverCls} 
          ${clrTheme.bgCls} transition-colors cursor-pointer p-1 pr-1.5 pl-1.5`}
          onMouseUp={()=>{console.log("selection made"); setSel(i); setActive(false);}}  
        >
          <span>{
            matched ? 
            <><span>{node.props.children.substring(0, foundIdx)}</span>
            <b>{matched[1]}</b>
            <span>{node.props.children.substring(foundIdx+matched[1].length)}</span></>
            : node.props.children
          }</span>
        </div>
      );
    } // if match or no search
  } // for options

  let clickComplete = false;
  return (
    <form className={`${clrTheme.textCls} outline-blue-600 rounded-md ${className}`}>
      <div className="flex">
        <input onInput={(event:React.FormEvent)=>{
            let inp = event.target as HTMLInputElement; 
            setFilter(inp.value);
          }} onMouseDown={
          (event:React.MouseEvent<Element>)=>{
            let inp = event.target as HTMLInputElement;
            if (!active) {
              setActive(true);
              event.preventDefault();
              // event blocks hover event triggers
              // and prevents one-click selection
              // however do not block event for editing input selection after modal is open
            }
            else if (active && filter == "") {
              setActive(false);
            }
          }}
          onMouseUp= {
            (event:React.MouseEvent<Element>)=>{
              let inp = event.target as HTMLInputElement;
              if (!clickComplete) {
                clickComplete = true;
                inp.focus();
                setInputReady(true);
              }
              console.log("mu", clickComplete);
            }
          }
          className={`w-[100%] ${clrTheme.textCls} ${clrTheme.bg2} text-lg ${active && filter != "" ? "" : "cursor-pointer"} 
          transition-colors focusable duration-250 p-1.5 grow-3 rounded-r-none`}
          placeholder={sel >= 0 ? options[sel] : "Search..."}
        />
        <Button className={`h-3px ${Themes.GREY.bgCls} 
        ${active ? "rounded-l-none w-md" : "!p-0 w-0 overflow-clip"} max-w-[fit-content] !transition-all`} 
        type="button" theme={Themes.GREY}>
          <GIcon theme={clrTheme}>close</GIcon>
        </Button>
      </div>
      <div className={
        `w-[100%] h-[fit-content] ${active ? "max-h-[100vh]" : "max-h-[0px]"} flex flex-col 
        overflow-clip transition-all duration-250 rounded-b-sm ${active?"outline-solid":""}`}>
        {processedChildren}
      </div>
      
    </form>
  )
}

export function GIcon({theme, className, children}:{theme:ColourTheme, className?:string, children:string}) {
  return <div className={"flex justify-center items-center "+className} >
    <span className="gicons">
      {children}
    </span>
  </div>
}

interface OptionProps {
  children: string,
  value?:any
}
export function Option(props : OptionProps) {
  return <></>;
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