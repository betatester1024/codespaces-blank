import { Metadata } from 'next';
import Page from './page';
export const metadata: Metadata = {
  title: 'Econ Dump Tools by Strawberry Clan Services',
  description: "Hex search, name search, leaderboards."
};

export default function PageLayout() {
  return (<Page/>)
}