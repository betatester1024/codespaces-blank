import { ColourTheme } from "./utils";


export const Themes: { [x: string]: ColourTheme; } = {
  GREY: {
    textCls: "grey text", activeCls: "grey active",
    hoverCls: "grey hover",
    bgMain: "grey bgMain", bgLight: "grey bgLight", bgStrong: "grey bgStrong"
  },
  GREEN: {
    textCls: "green text", activeCls: "green active",
    hoverCls: "green hover",
    bgMain: "green bgMain", bgLight: "green bgLight", bgStrong: "green bgStrong"
  },
  BLUE: {
    textCls: "blue text", activeCls: "blue active",
    hoverCls: "blue hover",
    bgMain: "blue bgMain", bgLight: "blue bgLight", bgStrong: "blue bgStrong"
  },
  RED: {
    textCls: "red text", activeCls: "red active",
    hoverCls: "red hover",
    bgMain: "red bgMain", bgLight: "red bgLight", bgStrong: "red bgStrong"
  },
  DARKGREY: {
    textCls: "darkgrey text", activeCls: "darkgrey active",
    hoverCls: "darkgrey hover",
    bgMain: "darkgrey bgMain", bgLight: "darkgrey bgLight", bgStrong: "darkgrey bgStrong"
  }
};
