import { Component } from '@angular/core';

import { FormBuilder, FormGroup, FormControl,Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
]; 
@Component({
  selector: 'app-create-agricultural',
  templateUrl: './create-agricultural.component.html',
  styleUrls: ['./create-agricultural.component.css']
})
export class CreateAgriculturalComponent{
// {
  Consignment= new FormControl('', [Validators.required]);
  Warehouse= new FormControl('', [Validators.required]);
  ClientId= new FormControl('', [Validators.required]);
  Commodity= new FormControl('', [Validators.required]);
  DriverName= new FormControl('', [Validators.required]);
  License= new FormControl('', [Validators.required]);
  PlaceIssued= new FormControl('', [Validators.required]);
  TruckPlate= new FormControl('', [Validators.required]);
  TrailerPlate= new FormControl('', [Validators.required]);
  VoucherNumber= new FormControl('', [Validators.required]);
  TruckNumberPlomps= new FormControl('', [Validators.required]);
  TrailerNumberPlomps= new FormControl('', [Validators.required]);
  Region= new FormControl('', [Validators.required]);
  Zone= new FormControl('', [Validators.required]);
  Woreda= new FormControl('', [Validators.required]);
  SpecficArea= new FormControl('', [Validators.required]);
  ProductionYear= new FormControl('', [Validators.required]);
  NumberOfBags= new FormControl('', [Validators.required]);
  VehicleSize= new FormControl('', [Validators.required]);
  EstimatedWeight= new FormControl('', [Validators.required]);
  GrossWeight= new FormControl('', [Validators.required]);
  TicketNumber= new FormControl('', [Validators.required]);
  DateReceived= new FormControl('', [Validators.required]);
// }
  createForm:FormGroup;

  constructor(public fb: FormBuilder) {
    this.createForm = this.fb.group({
      Consignment: this.Consignment,
      Warehouse: this.Warehouse,
      ClientId: this.ClientId,
      Commodity: this.Commodity,
      DriverName: this.DriverName,
      License: this.License,
      PlaceIssued: this.PlaceIssued,
      TruckPlate: this.TruckPlate,
      TrailerPlate: this.TrailerPlate,
      VoucherNumber: this.VoucherNumber,
      TruckNumberPlomps: this.TruckNumberPlomps,
      TrailerNumberPlomps: this.TrailerNumberPlomps,
      Region: this.Region,
      Zone: this.Zone,
      Woreda: this.Woreda,
      SpecficArea: this.SpecficArea,
      ProductionYear: this.ProductionYear,
      NumberOfBags: this.NumberOfBags,
      VehicleSize: this.VehicleSize,
      EstimatedWeight: this.EstimatedWeight,
      GrossWeight: this.GrossWeight,
      TicketNumber: this.TicketNumber,
      DateReceived: this.DateReceived
    });
  }

  ngOnInit(): void {
    
  }
  onSubmit () {
    console.log(this.createForm)
  }
}

