import { LightningElement } from 'lwc';

export default class EmployeeDetail extends LightningElement {
  employee = {
    name: 'Mr. Michael Niall',
    employeeNumber: '12453234',
    phone: '283-434-3454',
    email: 'michael.niall@company.com',
    alternateEmail: 'mikeniall@gmail.com',
    status: 'Active'
  };

  assets = [
    {
      id: 1,
      name: 'MacBook Air 13-in',
      serialNumber: 'C02ZL0ABMD6M',
      installDate: '02/23/2025',
      quantity: 1
    },
    {
      id: 2,
      name: 'Iphone 15',
      serialNumber: 'C02ZL0ABMD6M',
      installDate: '02/23/2025',
      quantity: 1
    }
  ];
}
