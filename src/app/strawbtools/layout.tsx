
import { Metadata } from "next";
import Page from './page';

export const metadata : Metadata = {
  title: "Econ Dumps",
  description: "this is a desc"
};

export default function PageLayout() {
  return (<Page/>);
}
