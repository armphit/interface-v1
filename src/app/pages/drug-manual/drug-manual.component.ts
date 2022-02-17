import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgSelectConfig } from '@ng-select/ng-select';
import { HttpsService } from 'src/app/services/https.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
// import 'moment/min/locales';
import * as JsonToXML from 'js2xmlparser';

export interface PeriodicElement {
  code: string;
  Name: string;
  spec: string;
  unit: string;
  firmName: string;
}

@Component({
  selector: 'app-drug-manual',
  templateUrl: './drug-manual.component.html',
  styleUrls: ['./drug-manual.component.scss'],
})
export class DrugManualComponent implements OnInit {
  selectedItem: any = '1';
  selectedSex: any = 'M';
  selectedCar!: number;
  @Input() selectedValues: any = null;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  public hnList: any = null;
  public inputGroup = new FormGroup({
    hn: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    birth: new FormControl(''),
    age: new FormControl('', [Validators.required]),
  });
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('swiper') swiper!: ElementRef;
  checkedJvm = true;
  checkedDih = true;
  constructor(
    private config: NgSelectConfig,
    private http: HttpsService,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';
    this.config.bindValue = 'value';
    this.getHN();
    this.getData();

    // this.inputGroup = this.formBuilder.group({
    //   hn: ['', Validators.required],
    //   name: ['', Validators.required],
    //   birth: ['', Validators.required],
    //   age: ['', Validators.required],
    // });
  }

  ngOnInit() {
    // this.selectedCountryId = this.countries[0].nested.countryId;
  }
  newData: any = null;
  public async getHN() {
    let getData: any = await this.http.get('listDataPatien2');
    this.hnList = getData.response.result;
    this.newData = this.hnList.map(
      (elm: {
        hn: string;
        patientname: string;
        patientdob: string;
        age: string;
        sex: string;
      }) => {
        return {
          ...elm,
          typeId:
            elm.hn +
            '-' +
            elm.patientname +
            '-' +
            elm.patientdob +
            '-' +
            elm.age +
            '-' +
            elm.sex,
        };
      }
    );
  }
  birthDate: any = null;
  clickHn = true;
  public onChange(event: any) {
    this.selectedValues = event;
    // this.valueChange.emit(this.selectedValues);
    if (event) {
      var splitted = event.split('-');

      const date = new Date(splitted[2], splitted[3], splitted[4]);
      const result = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      this.inputGroup = this.formBuilder.group({
        hn: [splitted[0], Validators.required],
        name: [splitted[1], Validators.required],
        birth: [result, Validators.required],
        age: [splitted[5], Validators.required],
      });
      this.selectedSex = splitted[6];
    }
    this.birthDate = splitted[4] + '-' + splitted[3] + '-' + splitted[2];
    this.clickHn = false;
  }
  public onChangeItem() {
    this.inputGroup.reset();
    this.selectedSex = 'M';
    this.selectedValues = null;
    this.dataDrug = null;
    this.birthDate = null;
    this.clickHn = true;
    this.value = [];
    this.isDisabled = true;
    this.getData();
  }

  public dataDrug: any = null;
  public dataSource: any = null;
  displayedColumns: string[] = [
    'select',
    'Code',
    'Name',
    'Spec',
    'Unit',
    'firmName',
  ];
  selected = '';

  public getData = async () => {
    let getData: any = await this.http.get('dataDrug');
    // let getData2: any = await this.http.get('jvmExpire');
    // console.log(getData2);

    if (getData.connect) {
      if (getData.response.rowCount > 0) {
        this.dataDrug = getData.response.result;
        this.dataSource = new MatTableDataSource(this.dataDrug);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  value = new Array();
  // value2 = new Array();
  isDisabled = true;
  selection: any = new SelectionModel<PeriodicElement>(true, []);

  async showOptions(e: any, val: any): Promise<void> {
    if (e.checked) {
      let formData = new FormData();
      formData.append('drugCode', val.code.trim());

      let dataDrug: any = await this.http.post('listDrugAll101', formData);
      let pack = null;
      if (dataDrug.connect) {
        if (dataDrug.response.rowCount > 0) {
          pack =
            'Pack : ' +
            Math.floor(dataDrug.response.result[0].pack) +
            ' ' +
            dataDrug.response.result[0].dosageunitcode;
        } else {
          pack = 'ไมมีแพ็คยา';
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      }

      const { value: text } = await Swal.fire({
        input: 'number',
        title: 'จำนวนยา',
        inputLabel: `${pack}`,
        inputPlaceholder: '',
        allowOutsideClick: false,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve('');
            } else {
              resolve('Input Value');
            }
          });
        },
      });
      if (text) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `จำนวนยา: ${text} ${val.unit}`,
          showConfirmButton: false,
          timer: 850,
        });
      }
      val.alias = '';
      val.method = '';
      val.type = '';
      val.note = '';
      val.itemNo = '';
      val.Qty = `${text}`;

      // val.itemNo = this.value.length + 1;

      this.value.push(val);
    } else {
      let index = this.value.indexOf(val);
      if (index > -1) {
        this.value.splice(index, 1);
      }
    }
    if (this.value.length > 0) {
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
    }
    this.selected = '';
    setTimeout(() => {
      this.swiper.nativeElement.focus();
    }, 1200);
  }

  noDrug() {
    Swal.fire('ไม่มีข้อมูลยา', '', 'error');
  }

  submitInput() {
    this.clickHn = false;
    this.inputGroup = this.formBuilder.group({
      hn: [this.inputGroup.value.hn, Validators.required],
      name: [this.inputGroup.value.name, Validators.required],
      birth: [this.inputGroup.value.birth],
      age: [this.inputGroup.value.age, Validators.required],
    });
  }
  dataAge: any = null;
  startChange(e: any) {
    const momentDate = new Date(this.inputGroup.value.birth);
    this.birthDate = moment(momentDate).format('YYYY-MM-DD');
    var dateBirth = moment(momentDate).format('DD-MM-YYYY');
    var dateParts = dateBirth.split('-');
    var dateObject = new Date(+dateParts[2], +dateParts[1], +dateParts[0]);
    var timeDiff = Math.abs(Date.now() - new Date(dateObject).getTime());
    this.dataAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
  }

  async send() {
    const momentDate = new Date();
    let datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    let dateB = moment(momentDate).add(543, 'year').format('DD/MM/YYYY');
    // let dateB = moment(momentDate).format('DD/MM/YYYY');

    let numJV = '6400' + Math.floor(Math.random() * 1000000);
    let getAge = new Date().getFullYear() - 2020;
    let codeArr = new Array();
    let codeArrPush = new Array();
    let codeArrSE = new Array();
    let numDontKnow = Math.floor(Math.random() * 10000);
    let dateBirthConvert = moment(this.birthDate).format('DD/MM/YYYY');
    // var utf8String = iconv.encode('Sample input string', 'win1251');

    let j = 0;
    let p = 0;

    let formData = new FormData();
    formData.append('hn', this.inputGroup.value.hn.trim());
    let getData2: any = await this.http.post('DataQ', formData);
    let dataQ = null;
    let numBox: number = 0;
    let arrSE = new Array();

    if (getData2.connect) {
      if (getData2.response.rowCount > 0) {
        dataQ = getData2.response.result[0].QN;
      } else {
        dataQ = '';
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    for (let i = 0; i < this.value.length; i++) {
      let formData = new FormData();
      formData.append('code', this.value[i].code.trim());

      let notSent: any = await this.http.post('drugNotSent', formData);
      if (notSent.response.rowCount === 0) {
        let listDrugOPD: any = await this.http.post('listDrugOPD', formData);

        if (listDrugOPD.response.rowCount > 0) {
          if (
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'N'
          ) {
            console.log(listDrugOPD.response.result[0]);
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

          let seCheckOutOfStock: any = await this.http.post(
            'seCheckOutOfStock',
            formData
          );
          var pre: any = {};

          if (
            this.value[i].Qty >=
              Number(listDrugOPD.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity) &&
            listDrugOPD.response.result[0].deviceCode.includes('Xmed1') &&
            listDrugOPD.response.result[0].isPrepack == 'Y'
          ) {
            console.log(listDrugOPD.response.result[0]);
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
              Math.floor(this.value[i].Qty / listDrugOPD.HisPackageRatio) *
                listDrugOPD.HisPackageRatio >
                0 &&
              listDrugOPD.deviceCode.includes('LCA')
            ) {
              console.log(listDrugOPD.response.result[0]);
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
        if (this.value[i].Qty > 0) {
          // let getData: any = await this.http.post('checkJV', formData);

          if (listDrugOPD.response.result[0].deviceCode.includes('JV')) {
            let getData2: any = await this.http.post('jvmExpire', formData);

            let dateC = null;
            let date = new Date();
            date.setFullYear(date.getFullYear() + 1);

            if (getData2.response.result[0].ExpiredDate) {
              dateC = moment(getData2.response.result[0].ExpiredDate)
                .add(543, 'year')
                .format('DD/MM/YYYY');
            } else {
              dateC = moment(date).add(543, 'year').format('DD/MM/YYYY');
            }
            let numMax: any;
            if (Number(getData2.response.result[0].QuantityMaximum)) {
              numMax = Number(getData2.response.result[0].QuantityMaximum);
            } else {
              numMax = this.value[i].Qty;
            }

            let amount: any;
            let qty = this.value[i].Qty;
            do {
              j++;
              amount = qty > numMax ? numMax : qty;

              let data =
                this.inputGroup.value.name +
                '|' +
                this.inputGroup.value.hn +
                j +
                '|' +
                numJV +
                '|' +
                dateBirthConvert +
                ' 0:00:00|OPD|||' +
                this.inputGroup.value.age +
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
                this.inputGroup.value.hn +
                '|' +
                dataQ +
                '|';

              codeArr.push(data);
              qty = qty - amount;
            } while (qty > 0);
          }
          codeArrPush.push(this.value[i]);
          console.log(codeArr);
          console.log(this.value[i].Qty);
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
          patID: this.inputGroup.value.hn,
          patName:
            this.inputGroup.value.name.length > 40
              ? this.inputGroup.value.name.substring(0, 30) +
                '...' +
                '(' +
                (i + 1) +
                '/' +
                op.length +
                ')'
              : this.inputGroup.value.name +
                '(' +
                (i + 1) +
                '/' +
                op.length +
                ')',
          gender: this.selectedSex,
          birthday: this.birthDate,
          age: this.inputGroup.value.age,
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
            outpNo: '',
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

    // if (
    //   (dih == 1 && jvm == 2) ||
    //   (dih == 2 && jvm == 1) ||
    //   (dih == 1 && jvm == 1)
    // ) {
    //   Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    // } else {
    //   Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    // }
    // let win: any = window;
    // win.$('.modal-backdrop').remove();
    // win.$('#myModal').modal('hide');

    this.value = [];
    this.inputGroup.reset();
    this.selectedSex = 'M';
    this.selectedValues = null;
    this.dataDrug = null;
    this.birthDate = null;
    this.getData();
    this.selected = '';
    this.clickHn = true;
    this.isDisabled = true;
    this.checkedDih = true;
    this.checkedJvm = true;
  }
}
