import type { OfficeMachine } from "./machine";

export type OfficeVessel = {
  id: string;
  name: string;
  imoNumber: string;
  description?: string;
  machines: OfficeMachine[];
};