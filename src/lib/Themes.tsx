import { ColourTheme } from "./utils";


export const Themes: { [x: string]: ColourTheme; } = {
  RED: {
    textCls: "text-red-400", activeCls: "active:text-red-300",
    hoverCls: "hover:text-red-500 hover:!bg-red-200 focus:text-red-500 focus:bg-red-200",
    bgMain: "bg-red-100", bgLight: "bg-red-50", bgStrong: "bg-red-200"
  },
  GREEN: {
    textCls: "text-lime-500", activeCls: "active:text-lime-300",
    hoverCls: "hover:text-lime-500 hover:!bg-lime-200 focus:text-lime-500 focus:bg-lime-100",
    bgMain: "bg-lime-100", bgLight: "bg-lime-50", bgStrong: "bg-lime-200"
  },
  BLUE: {
    textCls: "text-blue-400", activeCls: "active:text-blue-300",
    hoverCls: "hover:text-blue-500 hover:!bg-blue-200 focus:text-blue-500 focus:bg-blue-100",
    bgMain: "bg-blue-100", bgLight: "bg-blue-50", bgStrong: "bg-blue-200"
  },
  GREY: {
    textCls: "text-gray-400", activeCls: "active:text-gray-300",
    hoverCls: "hover:text-gray-500 hover:!bg-gray-200 focus:text-gray-500 focus:bg-gray-100",
    bgMain: "bg-gray-100", bgLight: "bg-gray-50", bgStrong: "bg-gray-200"
  }
};
