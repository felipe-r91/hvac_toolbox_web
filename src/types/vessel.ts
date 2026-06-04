import type { OfficeMachine } from "./machine";

export type OfficeVessel = {
  id: string;
  name: string;
  imoNumber: string;
  vesselImo: string;
  vesselType: string;
  ownerCustomer: string;
  vesselContact: string;
  description?: string;
  machines: OfficeMachine[];
};
