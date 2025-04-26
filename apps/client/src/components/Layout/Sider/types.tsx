import { ReactNode } from "react";

export interface SiderLink {
  label: string;
  link: string;
  icon: ReactNode;
  iconOn: ReactNode;
  restrict?: "guest";
}

export interface SiderCategory {
  label: string;
  items: SiderLink[];
}
