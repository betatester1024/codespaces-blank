"use client"

import React, { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export const Colour = {
  RED:  " text-red-400 active:text-red-300 hover:text-red-500 ",
  GREEN:" text-green-400 active:text-green-300 hover:text-green-500 hover:bg-green-100",
  BLUE: " text-blue-400 active:text-blue-300 hover:text-blue-500 hover:bg-blue-100 ",
  GREY: " text-gray-400 active:text-gray-300 hover:text-gray-500 "
}

export function byId(id:string) {
  return document.getElementById(id)!;
} 

export function Button({ baseClr: clrClass, children:content, className:extraClasses, onClick:eCallBk, type="button"} : {baseClr:string, children:ReactNode, onClick?:()=>any, className:string, type?:string}) {
  return (
    <button 
      type={type as ("submit" | "reset" | "button" | undefined)} 
      onClick={eCallBk}
      className={clrClass + `cursor-pointer rounded-sm p-2 transition-colors ${extraClasses}`}
    >
      {content}
    </button>
  );
}