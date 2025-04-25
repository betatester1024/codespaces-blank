"use client"

import React, { ReactNode } from "react";

export const Colour = {
  RED:  " text-red-400 active:text-red-300 hover:text-red-500 hover:bg-red-100 ",
  GREEN:" text-green-400 active:text-green-300 hover:text-green-500 hover:bg-green-100 ",
  BLUE: " text-blue-400 active:text-blue-300 hover:text-blue-500 hover:bg-blue-100 ",
  GREY: " text-gray-400 active:text-gray-400 hover:text-gray-500 hover:bg-gray-100 "
}

export function byId(id:string) {
  return document.getElementById(id)!;
} 

export function Button({ baseClr: clrClass, children:content, className:extraClasses="", onClick:eCallBk, type="button"} : {baseClr:string, children:ReactNode, onClick?:()=>any, className?:string, type?:string}) {
  return (
    <button 
      type={type as ("submit" | "reset" | "button" | undefined)} 
      onClick={eCallBk}
      className={clrClass + ` cursor-pointer rounded-sm p-2 transition-colors ${extraClasses}`}
    >
      {content}
    </button>
  );
}

export function Lister({rows, baseClr, children} : {rows:ReactNode[][], baseClr:string, children?:ReactNode}) {
  let items: ReactNode[] = [];
  for (let i=0; i<rows.length; i++) {
    items.push(<div className="flex gap-1">{rows[i]}</div>);
  }
  return (
    <div>
      {items}
    </div>
  )
}