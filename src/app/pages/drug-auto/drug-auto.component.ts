import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpsService } from 'src/app/services/https.service';
import Swal from 'sweetalert2';
export interface PeriodicElement {
  hn: number;
  patientname: string;
  readdatetime: number;
}
const ELEMENT_DATA: PeriodicElement[] = [
  { hn: 1, patientname: 'Hydrogen', readdatetime: 1.0079 },
  { hn: 2, patientname: 'Helium', readdatetime: 4.0026 },
  { hn: 3, patientname: 'Lithium', readdatetime: 6.941 },
  { hn: 4, patientname: 'Beryllium', readdatetime: 9.0122 },
  { hn: 5, patientname: 'Boron', readdatetime: 10.811 },
  { hn: 6, patientname: 'Carbon', readdatetime: 12.0107 },
  { hn: 7, patientname: 'Nitrogen', readdatetime: 14.0067 },
  { hn: 8, patientname: 'Oxygen', readdatetime: 15.9994 },
  { hn: 9, patientname: 'Fluorine', readdatetime: 18.9984 },
  { hn: 10, patientname: 'Neon', readdatetime: 20.1797 },
  { hn: 11, patientname: 'Oxygen', readdatetime: 15.9994 },
  { hn: 12, patientname: 'Fluorine', readdatetime: 18.9984 },
  { hn: 13, patientname: 'Neon', readdatetime: 20.1797 },
];

@Component({
  selector: 'app-drug-auto',
  templateUrl: './drug-auto.component.html',
  styleUrls: ['./drug-auto.component.scss'],
})
export class DrugAutoComponent implements OnInit {
  selectedRowIndex: any;
  displayedColumns: string[] = [
    'indexrow',
    'hn',
    'patientname',
    'readdatetime',
    'sendMachine',
  ];
  displayedColumns2: string[] = [
    'num',
    'orderitemcode',
    'orderitemname',
    'orderqty',
    'orderunitcode',
    'ordercreatedate',
  ];
  dataSource: any = null;
  @ViewChild('swiper') swiper!: ElementRef;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private http: HttpsService
  ) {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 0);
    this.getData();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 0);
    this.selectedRowIndex = 1;
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  highlight(row: any) {
    this.selectedRowIndex = row.indexrow;
    this.getDataPatien(row.hn, row.patientname);
  }

  public dataDrug: any = null;

  public async getData() {
    let getData: any = await this.http.get('patienListHN');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        this.getDataPatien(this.dataDrug[0].hn, this.dataDrug[0].patientname);
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  public dataDrugPatien: any = null;
  public dataSource2: any = null;
  public prescriptionnoT: string = '';
  public nameT: string = '';
  public brithdayT: string = '';
  public hnT: string = '';
  public sexT: string = '';

  public async getDataPatien(hn: any, name: any) {
    let dataForm = new FormData();
    dataForm.append('hn', hn);
    let getData: any = await this.http.post('listDataPatien', dataForm);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrugPatien = getData.response.result;
        this.prescriptionnoT = getData.response.result[0].prescriptionno;
        this.nameT = name;
        if (getData.response.result[0].sex == 'M') {
          this.sexT = 'ชาย';
        } else {
          this.sexT = 'หญิง';
        }

        var sliced = getData.response.result[0].patientdob.slice(0, -13);
        var splitted = sliced.split('-', 3);
        const date = new Date(splitted[0], splitted[1], splitted[2]);
        const result = date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        this.brithdayT = result;
        this.hnT = hn;
        this.dataSource2 = new MatTableDataSource(this.dataDrugPatien);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  public applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
