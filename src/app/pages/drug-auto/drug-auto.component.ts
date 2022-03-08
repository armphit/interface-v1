import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
  @ViewChild('input') input!: ElementRef;
  @ViewChild('test') test!: ElementRef;
  // @ViewChild('valqty') valqty!: ElementRef;
  @ViewChild('MatPaginator') paginator!: MatPaginator;
  @ViewChild('MatPaginator2') paginator2!: MatPaginator;
  @ViewChild('MatSort') sort!: MatSort;
  @ViewChild('MatSort2') sort2!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private http: HttpsService
  ) {
    // setTimeout(() => {
    //   this.swiper.nativeElement.focus();
    // }, 0);
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
  // value2 = new Array();
  async dataDrugSend(e: any) {
    e.target.blur();

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

      // let win: any = window;
      // // win.$('.modal-backdrop').remove();
      // win.$('#myModal').modal('show');
      // Swal.fire({
      //   title: 'Do you want to send the changes?',
      //   showCancelButton: true,
      //   confirmButtonText: 'Send',
      //   allowOutsideClick: false,
      // }).then((result) => {
      //   /* Read more about isConfirmed, isDenied below */
      //   if (result.isConfirmed) {
      //     // console.log(this.value);
      //     this.send();
      //   } else {
      //     this.value = [];
      //   }
      //   // else if (result.isDenied) {
      //   //   Swal.fire('Changes are not saved', '', 'info')
      //   // }
      // });
    } else {
      Swal.fire('ไม่มีข้อมูลยา!', '', 'error');
    }
  }

  checkedJvm = true;
  checkedDih = true;
  async send() {
    const momentDate = new Date();
    let datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    let dateB = moment(momentDate).add(543, 'year').format('DD/MM/YYYY');
    // let dateB = moment(momentDate).format('DD/MM/YYYY');
    // let numRandom =
    //   '99' +
    //   Math.floor(Math.random() * 100000000) +
    //   '_' +
    //   Math.floor(Math.random() * 100);

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
    let numBox: number = 0;
    let arrSE = new Array();
    let codeArrSE = new Array();

    for (let i = 0; i < this.value.length; i++) {
      let formData = new FormData();

      let drugT = this.value[i].code || this.value[i].orderitemcode;

      formData.append('code', drugT.trim());

      let notSent: any = await this.http.post('drugNotSent', formData);

      if (notSent.response.rowCount === 0) {
        // let listDrugSE: any = await this.http.post(
        //   'SEListStockPrepack',
        //   formData
        // );

        let listDrugOPD: any = await this.http.post('listDrugOPD', formData);
        let seCheckOutOfStock: any = await this.http.post(
          'seCheckOutOfStock',
          formData
        );
        if (listDrugOPD.response.rowCount > 0) {
          if (
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'N' &&
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity)
          ) {
            var qtyBox: number =
              this.value[i].Qty /
              listDrugOPD.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              var se: any = {};
              se.code = listDrugOPD.response.result[0].drugCode;
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
                    listDrugOPD.response.result[0].HisPackageRatio
                ) * listDrugOPD.response.result[0].HisPackageRatio;
              this.value[i].Qty =
                this.value[i].Qty %
                listDrugOPD.response.result[0].HisPackageRatio;
              arrSE.push(se);
            } else {
              do {
                se = {};

                se.code = listDrugOPD.response.result[0].drugCode;
                se.Name = this.value[i].Name;
                se.alias = this.value[i].alias;
                se.firmName = this.value[i].firmName;
                se.method = this.value[i].method;
                se.note = this.value[i].note;
                se.spec = this.value[i].spec;
                se.type = this.value[i].type;
                se.unit = this.value[i].unit;
                se.Qty =
                  Math.abs(numBox - 10) *
                  listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(se);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);

                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var seS: any = {};

                seS.code = listDrugOPD.response.result[0].drugCode;
                seS.Name = this.value[i].Name;
                seS.alias = this.value[i].alias;
                seS.firmName = this.value[i].firmName;
                seS.method = this.value[i].method;
                seS.note = this.value[i].note;
                seS.spec = this.value[i].spec;
                seS.type = this.value[i].type;
                seS.unit = this.value[i].unit;
                seS.Qty =
                  qtyBox * listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(seS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugOPD.response.result[0].HisPackageRatio;
          }

          // formData.append('prepack', this.value[i].code.trim() + '-');
          // let listDrugPre: any = await this.http.post(
          //   'PrepackListStock',
          //   formData
          // );

          // let numPack = listDrugPre.response.result[0].HisPackageRatio;

          var pre: any = {};

          if (
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'Y' &&
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity)
          ) {
            var qtyBox: number =
              this.value[i].Qty /
              listDrugOPD.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              pre.code = listDrugOPD.response.result[0].drugCode;
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
                    listDrugOPD.response.result[0].HisPackageRatio
                ) * listDrugOPD.response.result[0].HisPackageRatio;
              this.value[i].Qty =
                this.value[i].Qty %
                listDrugOPD.response.result[0].HisPackageRatio;
              arrSE.push(pre);
            } else {
              do {
                pre.code = listDrugOPD.response.result[0].drugCode;
                pre.Name = this.value[i].Name;
                pre.alias = this.value[i].alias;
                pre.firmName = this.value[i].firmName;
                pre.method = this.value[i].method;
                pre.note = this.value[i].note;
                pre.spec = this.value[i].spec;
                pre.type = this.value[i].type;
                pre.unit = this.value[i].unit;
                pre.Qty =
                  Math.abs(numBox - 10) *
                  listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(pre);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);
                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var preS: any = {};
                preS.code = listDrugOPD.response.result[0].drugCode;
                preS.Name = this.value[i].Name;
                preS.alias = this.value[i].alias;
                preS.firmName = this.value[i].firmName;
                preS.method = this.value[i].method;
                preS.note = this.value[i].note;
                preS.spec = this.value[i].spec;
                preS.type = this.value[i].type;
                preS.unit = this.value[i].unit;
                preS.Qty =
                  qtyBox * listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(preS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugOPD.response.result[0].HisPackageRatio;
          }

          // let listDrugLCA: any = await this.http.post('listDrugLCA', formData);
          listDrugOPD.response.result.forEach((listDrugOPD: any) => {
            if (
              listDrugOPD.deviceCode.includes('LCA') &&
              Math.floor(this.value[i].Qty / listDrugOPD.HisPackageRatio) *
                listDrugOPD.HisPackageRatio >
                0
            ) {
              var lca: any = {};
              lca.code = listDrugOPD.drugCode;
              lca.Qty =
                Math.floor(this.value[i].Qty / listDrugOPD.HisPackageRatio) *
                listDrugOPD.HisPackageRatio;

              lca.Name = this.value[i].Name;
              lca.alias = this.value[i].alias;
              lca.firmName = this.value[i].firmName;
              lca.method = this.value[i].method;
              lca.note = this.value[i].note;
              lca.spec = this.value[i].spec;
              lca.type = this.value[i].type;
              lca.unit = this.value[i].unit;

              codeArrPush.push(lca);

              this.value[i].Qty =
                this.value[i].Qty % listDrugOPD.HisPackageRatio;
            }
          });
        }

        let numMax: any;
        if (this.value[i].Qty > 0) {
          if (listDrugOPD.response.rowCount > 0) {
            if (listDrugOPD.response.result[0].deviceCode.includes('JV')) {
              let getData2: any = await this.http.post('jvmExpire', formData);

              let dateC = null;
              let date = new Date();
              date.setFullYear(date.getFullYear() + 1);

              if (getData2.response.rowCount > 0) {
                if (getData2.response.result[0].ExpiredDate) {
                  dateC = moment(getData2.response.result[0].ExpiredDate)
                    .add(543, 'year')
                    .format('DD/MM/YYYY');
                } else {
                  dateC = moment(date).add(543, 'year').format('DD/MM/YYYY');
                }

                if (Number(getData2.response.result[0].QuantityMaximum)) {
                  numMax = Number(getData2.response.result[0].QuantityMaximum);
                } else {
                  numMax = this.value[i].Qty;
                }
              }

              let amount: any;
              let qty = this.value[i].Qty;
              do {
                j++;
                amount = qty > 400 ? 400 : qty;
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
                  amount +
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
                qty = qty - amount;
              } while (qty > 0);
            }
          }
          codeArrPush.push(this.value[i]);
        }
      }
    }

    let DataJV: any = null;
    if (codeArr.length > 0) {
      for (let i = 0; i < codeArr.length; i++) {
        codeArr[i] = codeArr[i] + '(' + (i + 1) + '/' + codeArr.length + ')';
      }

      DataJV = codeArr.join('\r\n');
    }

    let op = [];
    for (let i = 0; i < codeArrSE.length; i++) {
      op.push(codeArrSE[i]);
    }

    op.push(arrSE.concat(codeArrPush));

    // let DataJV2: any = null;
    // let DataFinal: any = [];

    let getDataJV: any = null;
    let getDataDIH: any = null;
    let value2 = [];
    let dih = 1;
    let jvm = 1;
    let numRandom = '9900' + Math.floor(Math.random() * 1000000000) + '_';
    for (let i = 0; i < op.length; i++) {
      for (let j = 0; j < op[i].length; j++) {
        let value = {
          drug: op[i][j],
        };
        value2.push(value);
      }
      let jsonDrug = {
        patient: {
          patID: this.hnT,
          patName:
            this.nameT.length > 30
              ? this.nameT.substring(0, 30) +
                '...' +
                '(' +
                (i + 1) +
                '/' +
                op.length +
                ')'
              : this.nameT + '(' + (i + 1) + '/' + op.length + ')',
          gender: this.dataDrugPatien[0].sex,
          birthday: this.dataDrugPatien[0].patientdob,
          age: age,
          identity: '',
          insuranceNo: '',
          chargeType: '',
        },
        prescriptions: {
          prescription: {
            orderNo: numRandom + (i + 1),
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
            drugs: value2,
          },
        },
      };
      value2 = [];
      let xmlDrug = JsonToXML.parse('outpOrderDispense', jsonDrug);
      console.log(xmlDrug);
      // if (this.checkedDih == true) {
      //   let dataXml = { data: xmlDrug };
      //   getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);
      //   if (getDataDIH.connect == true) {
      //     if (getDataDIH.response == 1) {
      //       dih = 1;
      //       // Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
      //     } else {
      //       dih = 2;
      //       // Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
      //     }
      //   } else {
      //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      //   }
      // }
    }

    // if (this.checkedJvm == true) {
    //   if (DataJV) {
    //     let dataJv = { data: DataJV };
    //     getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    //     if (getDataJV.connect == true) {
    //       if (getDataJV.response == 1) {
    //         jvm = 1;
    //       } else if (getDataJV.response == 0) {
    //         jvm = 2;
    //       }
    //     } else {
    //       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //     }
    //   }
    // }

    if (
      (dih == 1 && jvm == 2) ||
      (dih == 2 && jvm == 1) ||
      (dih == 1 && jvm == 1)
    ) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'ส่งข้อมูลเสร็จสิ้น',
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    }

    let win: any = window;
    win.$('.modal-backdrop').remove();
    win.$('#myModal').modal('hide');

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

  public dataPatient: any = null;

  public async sendit(data: any) {
    let dateC = moment(new Date()).add(543, 'year').format('YYYYMMDD');

    let dataH = { data: data, date: dateC };
    let getData: any;
    getData = await this.http.syncNodejs('syncOPD', dataH);

    // if (getData.connect) {
    //   if (getData.response.data.length > 0) {
    //     let hn = getData.response.data[0].hn.trim();
    //     let sex = getData.response.data[0].sex.trim();
    //     let prescriptionno = getData.response.data[0].prescriptionno.trim();

    //     let m = moment(
    //       getData.response.data[0].patientdob,
    //       'YYYYMMDD',
    //       'th',
    //       true
    //     );

    //     let birthDate = moment(m)
    //       .add(1, 'month')
    //       .subtract(543, 'year')
    //       .format('YYYY-MM-DD');
    //     this.dataPatient = {
    //       birthDate: birthDate,
    //       hn: hn,
    //       sex: sex,
    //       prescriptionno: prescriptionno,
    //     };

    //     for (let i = 0; i < getData.response.data.length; i++) {
    //       let dataForm = new FormData();
    //       dataForm.append(
    //         'drugCode',
    //         getData.response.data[i].orderitemcode.trim()
    //       );
    //       let getData2: any = await this.http.post('listDrugAll101', dataForm);

    //       if (getData2.connect) {
    //         if (
    //           getData2.response.rowCount > 0 &&
    //           Number(getData.response.data[i].orderqty.trim()) > 0
    //         ) {
    //           let drug = {
    //             Name: getData.response.data[i].patientname.trim(),
    //             Qty: getData.response.data[i].orderqty.trim(),
    //             alias: '',
    //             code: getData.response.data[i].orderitemcode.trim(),
    //             firmName: getData2.response.result[0].firmname,
    //             method: '',
    //             note: '',
    //             spec: getData2.response.result[0].Strength,
    //             type: '',
    //             unit: getData.response.data[i].orderunitcode.trim(),
    //           };
    //           this.value.push(drug);
    //           // await this.sendHomc();
    //         }
    //       } else {
    //         Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    //       }
    //     }
    //   } else {
    //     Swal.fire('ไม่มีข้อมูลยา!', '', 'error');
    //   }
    // } else {
    //   Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    // }
  }

  selection: any = new SelectionModel<PeriodicElement>(true, []);
  async showOptions(e: any, val: any) {
    if (e.checked) {
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.Qty = '';

      // val.itemNo = this.value.length + 1;

      // this.value.push(val);
    } else {
      let index = this.value.indexOf(val);
      if (index > -1) {
        this.value.splice(index, 1);
      }
    }
  }

  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource2.data.length;

  //   return numSelected === numRows;
  // }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected()
  //     ? this.selection.clear()
  //     : this.dataSource2.data.forEach((row: any) => this.selection.select(row));
  // }
  myModel: any;

  changeStatus(e: any, row: any) {
    this.dataDrugPatien[row].status = false;
    this.myModel = row;
  }
  close() {
    this.value = [];
  }

  async sendHomc() {
    const momentDate = new Date();
    let datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    let dateB = moment(momentDate).add(543, 'year').format('DD/MM/YYYY');
    // let dateB = moment(momentDate).format('DD/MM/YYYY');
    // let numRandom =
    //   '99' +
    //   Math.floor(Math.random() * 100000000) +
    //   '_' +
    //   Math.floor(Math.random() * 100);

    let numJV = '6400' + Math.floor(Math.random() * 1000000);
    let getAge = new Date().getFullYear() - 2020;
    let codeArr = new Array();
    let codeArrPush = new Array();
    let numDontKnow = Math.floor(Math.random() * 10000);
    let dateBirthConvert = '';

    var dateParts = '';
    var dateObject = new Date(+dateParts[0], +dateParts[1], +dateParts[2]);
    var timeDiff = Math.abs(Date.now() - new Date(dateObject).getTime());
    var age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
    // var utf8String = iconv.encode('Sample input string', 'win1251');

    let j = 0;
    let p = 0;
    let numBox: number = 0;
    let arrSE = new Array();
    let codeArrSE = new Array();

    for (let i = 0; i < this.value.length; i++) {
      let formData = new FormData();

      let drugT = this.value[i].code || this.value[i].orderitemcode;

      formData.append('code', drugT.trim());

      let notSent: any = await this.http.post('drugNotSent', formData);

      if (notSent.response.rowCount === 0) {
        // let listDrugSE: any = await this.http.post(
        //   'SEListStockPrepack',
        //   formData
        // );

        let listDrugOPD: any = await this.http.post('listDrugOPD', formData);
        let seCheckOutOfStock: any = await this.http.post(
          'seCheckOutOfStock',
          formData
        );
        if (listDrugOPD.response.rowCount > 0) {
          if (
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'N' &&
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity)
          ) {
            var qtyBox: number =
              this.value[i].Qty /
              listDrugOPD.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              var se: any = {};
              se.code = listDrugOPD.response.result[0].drugCode;
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
                    listDrugOPD.response.result[0].HisPackageRatio
                ) * listDrugOPD.response.result[0].HisPackageRatio;
              this.value[i].Qty =
                this.value[i].Qty %
                listDrugOPD.response.result[0].HisPackageRatio;
              arrSE.push(se);
            } else {
              do {
                se = {};

                se.code = listDrugOPD.response.result[0].drugCode;
                se.Name = this.value[i].Name;
                se.alias = this.value[i].alias;
                se.firmName = this.value[i].firmName;
                se.method = this.value[i].method;
                se.note = this.value[i].note;
                se.spec = this.value[i].spec;
                se.type = this.value[i].type;
                se.unit = this.value[i].unit;
                se.Qty =
                  Math.abs(numBox - 10) *
                  listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(se);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);

                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var seS: any = {};

                seS.code = listDrugOPD.response.result[0].drugCode;
                seS.Name = this.value[i].Name;
                seS.alias = this.value[i].alias;
                seS.firmName = this.value[i].firmName;
                seS.method = this.value[i].method;
                seS.note = this.value[i].note;
                seS.spec = this.value[i].spec;
                seS.type = this.value[i].type;
                seS.unit = this.value[i].unit;
                seS.Qty =
                  qtyBox * listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(seS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugOPD.response.result[0].HisPackageRatio;
          }

          // formData.append('prepack', this.value[i].code.trim() + '-');
          // let listDrugPre: any = await this.http.post(
          //   'PrepackListStock',
          //   formData
          // );

          // let numPack = listDrugPre.response.result[0].HisPackageRatio;

          var pre: any = {};

          if (
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'Y' &&
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity)
          ) {
            var qtyBox: number =
              this.value[i].Qty /
              listDrugOPD.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              pre.code = listDrugOPD.response.result[0].drugCode;
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
                    listDrugOPD.response.result[0].HisPackageRatio
                ) * listDrugOPD.response.result[0].HisPackageRatio;
              this.value[i].Qty =
                this.value[i].Qty %
                listDrugOPD.response.result[0].HisPackageRatio;
              arrSE.push(pre);
            } else {
              do {
                pre.code = listDrugOPD.response.result[0].drugCode;
                pre.Name = this.value[i].Name;
                pre.alias = this.value[i].alias;
                pre.firmName = this.value[i].firmName;
                pre.method = this.value[i].method;
                pre.note = this.value[i].note;
                pre.spec = this.value[i].spec;
                pre.type = this.value[i].type;
                pre.unit = this.value[i].unit;
                pre.Qty =
                  Math.abs(numBox - 10) *
                  listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(pre);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);
                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var preS: any = {};
                preS.code = listDrugOPD.response.result[0].drugCode;
                preS.Name = this.value[i].Name;
                preS.alias = this.value[i].alias;
                preS.firmName = this.value[i].firmName;
                preS.method = this.value[i].method;
                preS.note = this.value[i].note;
                preS.spec = this.value[i].spec;
                preS.type = this.value[i].type;
                preS.unit = this.value[i].unit;
                preS.Qty =
                  qtyBox * listDrugOPD.response.result[0].HisPackageRatio;

                arrSE.push(preS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugOPD.response.result[0].HisPackageRatio;
          }

          // let listDrugLCA: any = await this.http.post('listDrugLCA', formData);
          listDrugOPD.response.result.forEach((listDrugOPD: any) => {
            if (
              listDrugOPD.deviceCode.includes('LCA') &&
              Math.floor(this.value[i].Qty / listDrugOPD.HisPackageRatio) *
                listDrugOPD.HisPackageRatio >
                0
            ) {
              var lca: any = {};
              lca.code = listDrugOPD.drugCode;
              lca.Qty =
                Math.floor(this.value[i].Qty / listDrugOPD.HisPackageRatio) *
                listDrugOPD.HisPackageRatio;

              lca.Name = this.value[i].Name;
              lca.alias = this.value[i].alias;
              lca.firmName = this.value[i].firmName;
              lca.method = this.value[i].method;
              lca.note = this.value[i].note;
              lca.spec = this.value[i].spec;
              lca.type = this.value[i].type;
              lca.unit = this.value[i].unit;

              codeArrPush.push(lca);

              this.value[i].Qty =
                this.value[i].Qty % listDrugOPD.HisPackageRatio;
            }
          });
        }

        let numMax: any;
        if (this.value[i].Qty > 0) {
          if (listDrugOPD.response.rowCount > 0) {
            if (listDrugOPD.response.result[0].deviceCode.includes('JV')) {
              let getData2: any = await this.http.post('jvmExpire', formData);

              let dateC = null;
              let date = new Date();
              date.setFullYear(date.getFullYear() + 1);

              if (getData2.response.rowCount > 0) {
                if (getData2.response.result[0].ExpiredDate) {
                  dateC = moment(getData2.response.result[0].ExpiredDate)
                    .add(543, 'year')
                    .format('DD/MM/YYYY');
                } else {
                  dateC = moment(date).add(543, 'year').format('DD/MM/YYYY');
                }

                if (Number(getData2.response.result[0].QuantityMaximum)) {
                  numMax = Number(getData2.response.result[0].QuantityMaximum);
                } else {
                  numMax = this.value[i].Qty;
                }
              }

              let amount: any;
              let qty = this.value[i].Qty;
              do {
                j++;
                amount = qty > 400 ? 400 : qty;
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
                  amount +
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
                qty = qty - amount;
              } while (qty > 0);
            }
          }
          codeArrPush.push(this.value[i]);
        }
      }
    }

    let DataJV: any = null;
    if (codeArr.length > 0) {
      for (let i = 0; i < codeArr.length; i++) {
        codeArr[i] = codeArr[i] + '(' + (i + 1) + '/' + codeArr.length + ')';
      }

      DataJV = codeArr.join('\r\n');
    }

    let op = [];
    for (let i = 0; i < codeArrSE.length; i++) {
      op.push(codeArrSE[i]);
    }

    op.push(arrSE.concat(codeArrPush));

    // let DataJV2: any = null;
    // let DataFinal: any = [];

    let getDataJV: any = null;
    let getDataDIH: any = null;
    let value2 = [];
    let dih = 1;
    let jvm = 1;
    let numRandom = '9900' + Math.floor(Math.random() * 1000000000) + '_';
    for (let i = 0; i < op.length; i++) {
      for (let j = 0; j < op[i].length; j++) {
        let value = {
          drug: op[i][j],
        };
        value2.push(value);
      }
      let jsonDrug = {
        patient: {
          patID: this.hnT,
          patName:
            this.nameT.length > 30
              ? this.nameT.substring(0, 30) +
                '...' +
                '(' +
                (i + 1) +
                '/' +
                op.length +
                ')'
              : this.nameT + ' (' + (i + 1) + '/' + op.length + ')',
          gender: 'this.dataPatient.sex',
          birthday: '',
          age: age,
          identity: '',
          insuranceNo: '',
          chargeType: '',
        },
        prescriptions: {
          prescription: {
            // orderNo: this.dataPatient.prescriptionno,
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
            drugs: value2,
          },
        },
      };
      value2 = [];
      let xmlDrug = JsonToXML.parse('outpOrderDispense', jsonDrug);
      console.log(1);
      // if (this.checkedDih == true) {
      //   let dataXml = { data: xmlDrug };
      //   getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);
      //   if (getDataDIH.connect == true) {
      //     if (getDataDIH.response == 1) {
      //       dih = 1;
      //       // Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
      //     } else {
      //       dih = 2;
      //       // Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
      //     }
      //   } else {
      //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      //   }
      // }
    }

    // if (this.checkedJvm == true) {
    //   if (DataJV) {
    //     let dataJv = { data: DataJV };
    //     getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    //     if (getDataJV.connect == true) {
    //       if (getDataJV.response == 1) {
    //         jvm = 1;
    //       } else if (getDataJV.response == 0) {
    //         jvm = 2;
    //       }
    //     } else {
    //       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //     }
    //   }
    // }

    if (
      (dih == 1 && jvm == 2) ||
      (dih == 2 && jvm == 1) ||
      (dih == 1 && jvm == 1)
    ) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'ส่งข้อมูลเสร็จสิ้น',
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    }

    let win: any = window;
    win.$('.modal-backdrop').remove();
    win.$('#myModal').modal('hide');
    this.swiper.nativeElement.focus();
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
    this.dataPatient = null;
    // this.birthDate = null;
    this.getData();
  }
}
