import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpsService } from 'src/app/services/https.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import * as JsonToXML from 'js2xmlparser';
import { SelectionModel } from '@angular/cdk/collections';
export interface PeriodicElement {
  select: string;
  num: number;
  orderitemcode: string;
  orderitemname: string;
  orderqty: string;
  orderunitcode: string;
  ordercreatedate: string;
}

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
    'select',
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
    this.selection.clear();
    this.getDataPatien(row.hn, row.patientname);
  }
  arrowUpEvent(row: object, index: number) {
    var nextrow = this.dataSource.filteredData[index - 2];

    this.highlight(nextrow);
  }

  arrowDownEvent(row: object, index: number) {
    var nextrow = this.dataSource.filteredData[index];

    this.highlight(nextrow);
  }

  public dataDrug: any = null;

  public async getData() {
    let getData: any = await this.http.get('listDataPatien2');

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        // console.log(this.dataDrug);
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
  public dataQ: any = null;

  public async getDataPatien(hn: any, name: any) {
    let dataForm = new FormData();
    dataForm.append('hn', hn.trim());
    let getData: any = await this.http.post('listDataPatien', dataForm);
    let getData2: any = await this.http.post('DataQ', dataForm);

    if (getData2.connect) {
      if (getData2.response.rowCount > 0) {
        this.dataQ = getData2.response.result[0].QN;
      } else {
        this.dataQ = '';
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
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

        // var sliced = getData.response.result[0].patientdob.slice(0, -13);

        var splitted = getData.response.result[0].patientdob.split('-', 3);
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
        this.dataSource2.data.forEach((row: any) => this.selection.select(row));
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

  value = new Array();
  value2 = new Array();
  async dataDrugSend() {
    // console.log(this.selection.selected);

    // this.selection.selected.forEach((s: any) => console.log(s));
    if (this.selection.selected.length > 0) {
      for (let i = 0; i < this.selection.selected.length; i++) {
        let dataForm = new FormData();
        dataForm.append('drugCode', this.selection.selected[i].orderitemcode);
        let getData: any = await this.http.post('listDrugAll101', dataForm);

        if (getData.connect) {
          if (
            getData.response.rowCount > 0 &&
            Number(this.selection.selected[i].orderqty) > 0
          ) {
            let drug = {
              Name: this.selection.selected[i].orderitemname,
              Qty: this.selection.selected[i].orderqty,
              alias: '',
              code: this.selection.selected[i].orderitemcode,
              firmName: getData.response.result[0].firmname,
              method: '',
              note: '',
              spec: getData.response.result[0].Strength,
              type: '',
              unit: this.selection.selected[i].orderunitcode,
            };
            this.value.push(drug);
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
        }
      }

      Swal.fire({
        title: 'Do you want to send the changes?',
        showCancelButton: true,
        confirmButtonText: 'Send',
        allowOutsideClick: false,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          // console.log(this.value);
          this.send();
        } else {
          this.value = [];
        }
        // else if (result.isDenied) {
        //   Swal.fire('Changes are not saved', '', 'info')
        // }
      });
    } else {
      Swal.fire('ไม่มีข้อมูลยา!', '', 'error');
    }
  }

  test() {
    Swal.fire({
      text: 'Toast with custom target',
      target: '#custom-target',
      customClass: {
        container: 'position-absolute',
      },
      toast: true,
      position: 'bottom-right',
    });
  }

  checkedJvm = true;
  checkedDih = true;
  async send() {
    const momentDate = new Date();
    let datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    // let dateB = moment(momentDate).add(543, 'year').format('DD/MM/YYYY');
    let dateB = moment(momentDate).format('DD/MM/YYYY');
    let numRandom =
      '99' +
      Math.floor(Math.random() * 100000000) +
      '_' +
      Math.floor(Math.random() * 100);

    let numJV = '6400' + Math.floor(Math.random() * 1000000);
    let getAge = new Date().getFullYear() - 2020;
    let codeArr = new Array();
    let codeArrPush = new Array();
    let numDontKnow = Math.floor(Math.random() * 10000);
    let dateBirthConvert = moment(this.dataDrugPatien[0].patientdob).format(
      'DD/MM/YYYY'
    );

    var dateParts = this.dataDrugPatien[0].patientdob.split('-');
    var dateObject = new Date(+dateParts[0], +dateParts[1], +dateParts[2]);
    var timeDiff = Math.abs(Date.now() - new Date(dateObject).getTime());
    var age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
    // var utf8String = iconv.encode('Sample input string', 'win1251');

    let j = 0;
    let p = 0;
    for (let i = 0; i < this.value.length; i++) {
      let formData = new FormData();

      let drugT = this.value[i].code || this.value[i].orderitemcode;

      formData.append('code', drugT.trim());

      let notSent: any = await this.http.post('drugNotSent', formData);

      if (notSent.response.rowCount === 0) {
        let listDrugSE: any = await this.http.post(
          'SEListStockPrepack',
          formData
        );

        if (listDrugSE.response.rowCount > 0) {
          // for (let xx = 0; xx < listDrugSE.response.rowCount; xx++) {
          var se: any = {};

          if (
            this.value[i].Qty >=
            Number(listDrugSE.response.result[0].HisPackageRatio)
          ) {
            se.code = listDrugSE.response.result[0].drugCode;
            se.Name = this.value[i].Name;
            se.alias = this.value[i].alias;
            se.firmName = this.value[i].firmName;
            se.method = this.value[i].method;
            se.note = this.value[i].note;
            se.spec = this.value[i].spec;
            se.type = this.value[i].type;
            se.unit = this.value[i].unit;
            se.Qty =
              Math.floor(
                this.value[i].Qty /
                  listDrugSE.response.result[0].HisPackageRatio
              ) * listDrugSE.response.result[0].HisPackageRatio;
            this.value[i].Qty =
              this.value[i].Qty % listDrugSE.response.result[0].HisPackageRatio;
            // console.log(this.numArr);
            codeArrPush.push(se);
          }
          // }
        }

        formData.append('prepack', drugT.trim() + '-');
        let listDrugPre: any = await this.http.post(
          'PrepackListStock',
          formData
        );

        if (listDrugPre.response.rowCount > 0) {
          var pre: any = {};

          if (
            this.value[i].Qty >=
            Number(listDrugPre.response.result[0].HisPackageRatio)
          ) {
            pre.code = listDrugPre.response.result[0]['drugCode'];
            pre.Name = this.value[i].Name;
            pre.alias = this.value[i].alias;
            pre.firmName = this.value[i].firmName;
            pre.method = this.value[i].method;
            pre.note = this.value[i].note;
            pre.spec = this.value[i].spec;
            pre.type = this.value[i].type;
            pre.unit = this.value[i].unit;
            pre.Qty =
              Math.floor(
                this.value[i].Qty /
                  listDrugPre.response.result[0].HisPackageRatio
              ) * listDrugPre.response.result[0].HisPackageRatio;
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugPre.response.result[0].HisPackageRatio;
            // console.log(this.numArr);
            codeArrPush.push(pre);
          }
        }

        let listDrugLCA: any = await this.http.post('listDrugLCA', formData);

        if (listDrugLCA.response.rowCount == 1) {
          if (
            Math.floor(
              this.value[i].Qty / listDrugLCA.response.result[0].packageRatio
            ) *
              listDrugLCA.response.result[0].packageRatio >
            0
          ) {
            var lca: any = {};
            lca.code = listDrugLCA.response.result[0].drugCode;
            lca.Qty =
              Math.floor(
                this.value[i].Qty / listDrugLCA.response.result[0].packageRatio
              ) * listDrugLCA.response.result[0].packageRatio;
            // this.numArr = this.numArr + 1;
            // a.itemNo = this.this.valueue.length + 1;
            lca.Name = this.value[i].Name;
            lca.alias = this.value[i].alias;
            lca.firmName = this.value[i].firmName;
            lca.method = this.value[i].method;
            lca.note = this.value[i].note;
            lca.spec = this.value[i].spec;
            lca.type = this.value[i].type;
            lca.unit = this.value[i].unit;
            // console.log(this.numArr);
            codeArrPush.push(lca);
            this.value[i].Qty =
              this.value[i].Qty % listDrugLCA.response.result[0].packageRatio;
            // if (
            //   this.value[i].Qty % listDrugLCA.response.result[0].packageRatio >
            //   0
            // ) {
            //   this.value[i].Qty =
            //     this.value[i].Qty % listDrugLCA.response.result[0].packageRatio;
            // }
          }
        }

        if (this.value[i].Qty > 0) {
          let getData: any = await this.http.post('checkJV', formData);

          if (getData.response.rowCount == 1) {
            let getData2: any = await this.http.post('jvmExpire', formData);

            let dateC = null;
            let date = new Date();
            date.setFullYear(date.getFullYear() + 1);

            // if (getData2.response.result[0].ExpiredDate) {
            //   dateC = moment(getData2.response.result[0].ExpiredDate)
            //     .add(543, 'year')
            //     .format('DD/MM/YYYY');
            // } else {
            //   dateC = moment(date).add(543, 'year').format('DD/MM/YYYY');
            // }

            if (getData2.response.result[0].ExpiredDate) {
              dateC = moment(getData2.response.result[0].ExpiredDate).format(
                'DD/MM/YYYY'
              );
            } else {
              dateC = moment(date).format('DD/MM/YYYY');
            }

            if (this.value[i].Qty > 400) {
              do {
                j++;
                let data =
                  this.nameT +
                  '|' +
                  this.hnT +
                  j +
                  '|' +
                  numJV +
                  '|' +
                  dateBirthConvert +
                  ' 0:00:00|OPD|||' +
                  age +
                  '||' +
                  numDontKnow +
                  '|I|' +
                  400 +
                  '|' +
                  this.value[i].code +
                  '|' +
                  this.value[i].Name +
                  '|' +
                  dateA +
                  '|' +
                  dateA +
                  '|' +
                  '00:0' +
                  j +
                  '|||โรงพยาบาลมหาราชนครราชสีมา|||' +
                  numJV +
                  this.value[i].code +
                  '|||' +
                  dateB +
                  '|' +
                  dateC +
                  '|' +
                  this.hnT +
                  '|' +
                  this.dataQ +
                  '|';

                codeArr.push(data);
                this.value[i].Qty = this.value[i].Qty - 400;
              } while (this.value[i].Qty > 400);
            }

            j++;

            let data =
              this.nameT +
              '|' +
              this.hnT +
              j +
              '|' +
              numJV +
              '|' +
              dateBirthConvert +
              ' 0:00:00|OPD|||' +
              age +
              '||' +
              numDontKnow +
              '|I|' +
              this.value[i].Qty +
              '|' +
              drugT +
              '|' +
              this.value[i].Name +
              '|' +
              dateA +
              '|' +
              dateA +
              '|' +
              '00:0' +
              j +
              '|||โรงพยาบาลมหาราชนครราชสีมา|||' +
              numJV +
              drugT +
              '|||' +
              dateB +
              '|' +
              dateC +
              '|' +
              this.hnT +
              '|' +
              this.dataQ +
              '|';
            codeArr.push(data);
          }

          codeArrPush.push(this.value[i]);
        }
      }
    }

    for (let index = 0; index < codeArrPush.length; index++) {
      codeArrPush[index].itemNo = index + 1;
      let value = {
        drug: codeArrPush[index],
      };
      this.value2.push(value);
    }

    let DataJV: any = null;
    // let DataJV2: any = null;
    // let DataFinal: any = [];

    if (codeArr.join('\r\n') != '') {
      DataJV = codeArr.join('\r\n');
    }

    let jsonDrug = {
      patient: {
        patID: this.hnT,
        patName:
          this.nameT.length > 30
            ? this.nameT.substring(0, 30) + '...'
            : this.nameT,
        gender: this.dataDrugPatien[0].sex,
        birthday: this.dataDrugPatien[0].patientdob,
        age: age,
        identity: '',
        insuranceNo: '',
        chargeType: '',
      },
      prescriptions: {
        prescription: {
          orderNo: numRandom,
          ordertype: 'M',
          pharmacy: 'OPD',
          windowNo: '',
          paymentIP: '',
          paymentDT: datePayment,
          outpNo: '3',
          visitNo: '',
          deptCode: '',
          deptName: '',
          doctCode: '',
          doctName: '',
          diagnosis: '',
          drugs: this.value2,
        },
      },
    };

    let xmlDrug = JsonToXML.parse('outpOrderDispense', jsonDrug);

    let getDataJV: any = null;
    let getDataDIH: any = null;

    if (this.checkedDih == true && this.checkedJvm == true) {
      if (DataJV) {
        let dataJv = { data: DataJV };
        getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
      }

      let dataXml = { data: xmlDrug };
      getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

      if (getDataJV) {
        if (getDataJV.connect == true) {
          if (getDataJV.response == 1) {
            Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
            let win: any = window;
            win.$('.modal-backdrop').remove();
            win.$('#myModal').modal('hide');
          } else if (getDataJV.response == 0) {
            Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
        }
      } else {
        if (getDataDIH.connect == true) {
          if (getDataDIH.response == 1) {
            Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
            let win: any = window;
            win.$('.modal-backdrop').remove();
            win.$('#myModal').modal('hide');
          } else {
            Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
        }
      }
    } else if (this.checkedDih == true && this.checkedJvm == false) {
      let dataXml = { data: xmlDrug };
      getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

      if (getDataDIH.connect == true) {
        if (getDataDIH.response == 1) {
          Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
          let win: any = window;
          win.$('.modal-backdrop').remove();
          win.$('#myModal').modal('hide');
        } else {
          Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      }
    } else if (this.checkedDih == false && this.checkedJvm == true) {
      if (DataJV) {
        let dataJv = { data: DataJV };
        getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
        if (getDataJV.connect == true) {
          if (getDataJV.response == 1) {
            Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
            let win: any = window;
            win.$('.modal-backdrop').remove();
            win.$('#myModal').modal('hide');
          } else if (getDataJV.response == 0) {
            Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
        }
      } else {
        Swal.fire('ข้อมูลไม่ถูกต้อง', '', 'error');
        let win: any = window;
        win.$('#myModal').modal('hide');
      }
    }
    let win: any = window;
    win.$('.modal-backdrop').remove();
    // win.$('#myModal').modal('hide');
    this.value2 = [];
    this.value = [];
    this.dataDrug = null;
    this.dataDrugPatien = null;
    this.nameT = '';
    this.hnT = '';
    this.checkedDih = true;
    this.checkedJvm = true;
    this.selection.clear();
    this.selectedRowIndex = 1;
    this.dataQ = null;
    // this.birthDate = null;
    this.getData();
  }

  public sendit(data: any): void {
    setTimeout(() => console.log(data), 1000);
  }

  selection: any = new SelectionModel<PeriodicElement>(true, []);
  async showOptions(e: any, val: any): Promise<void> {
    if (e.checked) {
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.Qty = '';

      // val.itemNo = this.value.length + 1;

      this.value.push(val);
    } else {
      let index = this.value.indexOf(val);
      if (index > -1) {
        this.value.splice(index, 1);
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource2.data.length;

    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource2.data.forEach((row: any) => this.selection.select(row));
  }
  myModel: boolean = true;
}
