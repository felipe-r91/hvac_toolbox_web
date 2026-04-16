export type OfficeMachine = {
  id: string;
  vesselId: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
};

export type OfficeVessel = {
  id: string;
  name: string;
  imoNumber: string;
  description?: string;
  machines: OfficeMachine[];
};