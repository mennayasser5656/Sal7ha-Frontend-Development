export interface ServiceDetail {
  label: string;
  value: string;
}

export default interface Booking {
  id: string;
  serviceId?: string | null;
  serviceName: string;
  serviceIcon: string;
  ownerIcon: string;
  name: string;
  carMake: string;
  carModel: string;
  carYear: string;
  startDate: string;
  endDate: string;
  status: string;
  price: number;
  serviceDetails: ServiceDetail[];
}
