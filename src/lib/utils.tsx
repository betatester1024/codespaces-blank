"use client"

import { validateHeaderValue } from "http";
import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";
import { useServerInsertedHTML } from "next/navigation";
import React, { ButtonHTMLAttributes, ChangeEvent, FormEvent, HTMLProps, KeyboardEvent, ReactElement, ReactNode, useEffect, useState } from "react";

type ColourTheme = {textCls:string, activeCls:string, hoverCls:string, bgCls:string, bg2:string, bgStrong:string};

export const Themes : {[x:string]:ColourTheme}= {
  RED:  {
    textCls:"text-red-400", activeCls:"active:text-red-300", 
    hoverCls:"hover:text-red-500 hover:bg-red-200 focus:text-red-500 focus:bg-red-200",
    bgCls:"bg-red-100", bg2:"bg-red-50", bgStrong:"bg-red-200"},
  GREEN:{
    textCls:"text-green-400", activeCls:"active:text-green-300", 
    hoverCls:"hover:text-green-500 hover:bg-green-200 focus:text-green-500 focus:bg-green-200",
    bgCls:"bg-green-100", bg2:"bg-green-50", bgStrong:"bg-green-200"
  },
  BLUE: {
    textCls:"text-blue-400", activeCls:"active:text-blue-300", 
    hoverCls:"hover:text-blue-500 hover:bg-blue-200 focus:text-blue-500 focus:bg-blue-200",
    bgCls:"bg-blue-100", bg2:"bg-blue-50", bgStrong:"bg-blue-200"
  },
  GREY: {
    textCls:"text-gray-400", activeCls:"active:text-gray-300", 
    hoverCls:"hover:text-gray-500 hover:bg-gray-200 focus:text-gray-500 focus:bg-gray-200",
    bgCls:"bg-gray-100", bg2:"bg-gray-50", bgStrong:"bg-gray-200"
  }
};

export function byId(id:string) {
  return document.getElementById(id);
} 

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme:ColourTheme, 
  children?:ReactNode, 
  className?:string, 
};

export function Button(props:ButtonProps) {
  return (
    <button 
      type={props.type} 
      tabIndex={props.tabIndex}
      onClick={props.onClick}
      className={`${props.className} ${props.theme.textCls} ${props.theme.activeCls} ${props.theme.hoverCls} 
      cursor-pointer rounded-sm p-2 transition-colors justify-center grow flex items-center `}
    >
      {props.children}
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
  let [active, setActive] = useState<boolean>(false);
  let [filter, setFilter] = useState<string>("");
  let [sel, setSel] = useState<number>(-1);
  let [selIdx, setSelIdx] = useState<number>(0);

  let matchOptns = [];
  if ((children as OptionElement[]).length == null) {
    children = [children] as OptionElement[];
  }
  children = children as OptionElement[];
  let options= [];
  let matchIdxes:number[] = [];
  let matchingCt = 0;
  for (let i=0; i<children.length; i++) {
    // console.log("searching", filter);
    let node = children[i];
    options.push(node.props.children);
    let regex = new RegExp("("+filter+")", "i")
    let matched = null;
    if (filter != "") matched = node.props.children.match(regex);
    // if active and (search produces something or no search) or not active (for animations)
    if (active && (filter != "" && matched || filter == "") || !active) {
      let foundIdx = node.props.children.search(regex);
      matchIdxes.push(i);
      matchOptns.push(
        <div 
          key={JSON.stringify({idx:i, value:node.props.value})} 
          className={`${matchingCt == selIdx ? clrTheme.bgCls : ""} ${clrTheme.textCls} ${clrTheme.activeCls} 
          ${clrTheme.bg2} transition-colors cursor-pointer p-1 pr-1.5 pl-1.5 ${clrTheme.hoverCls} 
          ${i==sel ? clrTheme.bgStrong :""} `}
          onMouseUp={()=>{setSel(i); setActive(false);}}  
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
      matchingCt++;
    } // if match or no search
  } // for options

  let [inputVal, setInputVal] = useState<string>("");
  useEffect(()=>{
    if (!active) {
      console.log("closed");
      setInputVal(sel >= 0 ? options[sel] : "Select...");
    }
    else {
      setFilter("");
      setInputVal("");
      setSelIdx(0);
    }
  }, [active])

  function onKeyPress(event:ChangeEvent<HTMLInputElement>) {
    setFilter(event.target.value);  
    setInputVal(event.target.value);
    setSelIdx(0);
  }

  function keydown(event:KeyboardEvent) {
    if (!active) {
      if (event.key == "Enter" || event.key == " ") {
        setActive(true);
        event.preventDefault();
      }
      return;
    }
    if (event.key == "ArrowUp") {
      setSelIdx(selIdx-1);
      event.preventDefault();
    }
    else if (event.key == "ArrowDown") {
      setSelIdx(selIdx+1);
      event.preventDefault();
    }
    if (event.key == "Enter") {
      if (matchIdxes.length > 0) setSel(matchIdxes[selIdx]);
      setActive(false);
    }
    if (event.key == "Escape") {
      setActive(false);
    }
    console.log(selIdx);
  }

  useEffect(()=>{
    if (matchOptns.length == 0) return;
    if (selIdx < 0) setSelIdx(matchOptns.length - 1);
    if (selIdx >= matchOptns.length) setSelIdx(0);
  }, [selIdx])


  let clickComplete = false;
  let input = 
  <input value={inputVal} readOnly={!active} onKeyDown={keydown} onChange={onKeyPress}
    onMouseDown={
    (event:React.MouseEvent<Element>)=>{
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
        }
      }
    }
    className={`w-[100%] ${clrTheme.textCls} ${clrTheme.bg2} text-lg ${active && filter != "" ? "" : "cursor-pointer"} 
      transition-colors duration-250 p-1.5 grow-3 rounded-r-none outline-none 
      ${active ? "" : clrTheme.hoverCls} select-none`
    }
    placeholder="Search..."
  />;
  return (
    <div className={`${clrTheme.textCls} focus-within:outline-2 
    relative ${active ? "outline-solid" : "outline-none" } rounded-md rounded-b-none ${className}`}
    >
      <div className="flex rounded-[inherit] overflow-clip">
        {input}
        <Button tabIndex={active ? 0 : -1} onClick={()=>{setActive(false)}} className={`h-3px ${Themes.GREY.bgCls} 
        ${active ? "rounded-l-none w-md" : "!p-0 w-0 overflow-clip"} max-w-[fit-content] !transition-all`} 
        type="button" theme={Themes.GREY}>
          <GIcon theme={clrTheme}>close</GIcon>
        </Button>
      </div>
      <div tabIndex={-1} className={
        `w-[100%] h-[fit-content] ${active ? "max-h-[50vh]" : "max-h-[0px]"} flex flex-col 
        overflow-scroll absolute transition-all duration-350 rounded-b-sm 
        ${active ? "outline-solid":""} ${matchOptns.length == 0 ? Themes.RED.textCls : ""}`}>
        { 
          matchOptns.length == 0 ?
            <span key="none" className={`p-1 pr-1.5 pl-1.5 ${Themes.RED.textCls} ${Themes.RED.hoverCls} ${Themes.RED.bg2}`}>No results found</span>
          : matchOptns
        }
      </div>
      
    </div>
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