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

  edit() {
    //     this.inputGroup = this.formBuilder.group({
    //   hn: ['', Validators.required],
    //   name: ['', Validators.required],
    //   birth: ['', Validators.required],
    //   age: ['', Validators.required],
    // });
    // this.inputGroup2 = this.formBuilder.group({
    //   hnS: ['0000', Validators.required],
    //   nameS: ['', Validators.required],
    //   sexS: ['M', Validators.required],
    //   ageS: ['1', Validators.required],
    // });
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

    // this.inputGroup = this.formBuilder.group({
    //   hn: [this.inputGroup.value.hn, Validators.required],
    //   name: [this.inputGroup.value.name, Validators.required],
    //   birth: [this.inputGroup.value.birth, Validators.required],
    //   age: [age, Validators.required],
    // });

    // console.log(this.birthDate);
  }

  async send() {
    const momentDate = new Date();
    let datePayment = moment(momentDate).format('YYYY-MM-DD');
    let dateA = moment(momentDate).format('YYMMDD');
    // let dateB = moment(momentDate).add(543, 'year').format('DD/MM/YYYY');
    let dateB = moment(momentDate).format('DD/MM/YYYY');

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

    let getData2: any = await this.http.post('DataQ', this.inputGroup.value.hn);
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
        let listDrugSE: any = await this.http.post(
          'SEListStockPrepack',
          formData
        );

        if (listDrugSE.response.rowCount > 0) {
          if (
            this.value[i].Qty >=
            Number(listDrugSE.response.result[0].HisPackageRatio)
          ) {
            var qtyBox: number =
              this.value[i].Qty / listDrugSE.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              var se: any = {};
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
                this.value[i].Qty %
                listDrugSE.response.result[0].HisPackageRatio;
              arrSE.push(se);
            } else {
              // console.log(
              //   (10 - (~~numBox - ~~qtyBox)) *
              //     listDrugSE.response.result[0].HisPackageRatio
              // );
              // console.log(
              //   (~~qtyBox - (10 - (~~numBox - ~~qtyBox))) *
              //     listDrugSE.response.result[0].HisPackageRatio
              // );

              // while (qtyBox > 10) {
              //   se.code = listDrugSE.response.result[0].drugCode;
              //   se.Name = this.value[i].Name;
              //   se.alias = this.value[i].alias;
              //   se.firmName = this.value[i].firmName;
              //   se.method = this.value[i].method;
              //   se.note = this.value[i].note;
              //   se.spec = this.value[i].spec;
              //   se.type = this.value[i].type;
              //   se.unit = this.value[i].unit;
              //   se.Qty =
              //     (10 - (numBox - ~~qtyBox)) *
              //     listDrugSE.response.result[0].HisPackageRatio;
              //   arrSE.push(se);
              //   codeArrSE.push(arrSE);
              //   qtyBox = qtyBox - 10;
              //   console.log(qtyBox);
              // }
              do {
                se = {};

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
                  Math.abs(numBox - 10) *
                  listDrugSE.response.result[0].HisPackageRatio;

                arrSE.push(se);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);

                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var seS: any = {};

                seS.code = listDrugSE.response.result[0].drugCode;
                seS.Name = this.value[i].Name;
                seS.alias = this.value[i].alias;
                seS.firmName = this.value[i].firmName;
                seS.method = this.value[i].method;
                seS.note = this.value[i].note;
                seS.spec = this.value[i].spec;
                seS.type = this.value[i].type;
                seS.unit = this.value[i].unit;
                seS.Qty =
                  qtyBox * listDrugSE.response.result[0].HisPackageRatio;

                // arrSE = [];
                arrSE.push(seS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty % listDrugSE.response.result[0].HisPackageRatio;
            // codeArrPush.push(se);
          }
        }

        formData.append('prepack', this.value[i].code.trim() + '-');
        let listDrugPre: any = await this.http.post(
          'PrepackListStock',
          formData
        );
        let seCheckOutOfStock: any = await this.http.post(
          'seCheckOutOfStock',
          formData
        );

        // let numPack = listDrugPre.response.result[0].HisPackageRatio;

        if (listDrugPre.response.rowCount > 0) {
          var pre: any = {};

          if (
            this.value[i].Qty >=
              Number(listDrugPre.response.result[0].HisPackageRatio) &&
            this.value[i].Qty <=
              Number(seCheckOutOfStock.response.result[0].Quantity)
          ) {
            //   pre.code = listDrugPre.response.result[0].drugCode;
            //   pre.Name = this.value[i].Name;
            //   pre.alias = this.value[i].alias;
            //   pre.firmName = this.value[i].firmName;
            //   pre.method = this.value[i].method;
            //   pre.note = this.value[i].note;
            //   pre.spec = this.value[i].spec;
            //   pre.type = this.value[i].type;
            //   pre.unit = this.value[i].unit;
            //   pre.Qty =
            //     Math.floor(
            //       this.value[i].Qty /
            //         listDrugPre.response.result[0].HisPackageRatio
            //     ) * listDrugPre.response.result[0].HisPackageRatio;
            //   this.value[i].Qty =
            //     this.value[i].Qty %
            //     listDrugPre.response.result[0].HisPackageRatio;

            //   codeArrPush.push(pre);

            var qtyBox: number =
              this.value[i].Qty /
              listDrugPre.response.result[0].HisPackageRatio;

            if (numBox + ~~qtyBox < 10) {
              numBox = numBox + ~~qtyBox;
              pre.code = listDrugPre.response.result[0].drugCode;
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
              arrSE.push(pre);
            } else {
              // console.log(
              //   (10 - (~~numBox - ~~qtyBox)) *
              //     listDrugSE.response.result[0].HisPackageRatio
              // );
              // console.log(
              //   (~~qtyBox - (10 - (~~numBox - ~~qtyBox))) *
              //     listDrugSE.response.result[0].HisPackageRatio
              // );
              do {
                // pre = {};
                pre.code = listDrugPre.response.result[0].drugCode;
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
                  listDrugPre.response.result[0].HisPackageRatio;

                arrSE.push(pre);
                codeArrSE.push(arrSE);
                arrSE = [];
                qtyBox = ~~qtyBox - Math.abs(numBox - 10);
                numBox = 0;
              } while (qtyBox > 9);
              if (qtyBox !== 0) {
                var preS: any = {};
                preS.code = listDrugPre.response.result[0].drugCode;
                preS.Name = this.value[i].Name;
                preS.alias = this.value[i].alias;
                preS.firmName = this.value[i].firmName;
                preS.method = this.value[i].method;
                preS.note = this.value[i].note;
                preS.spec = this.value[i].spec;
                preS.type = this.value[i].type;
                preS.unit = this.value[i].unit;
                preS.Qty =
                  qtyBox * listDrugPre.response.result[0].HisPackageRatio;

                arrSE.push(preS);
                numBox = qtyBox;
              }
            }
            this.value[i].Qty =
              this.value[i].Qty %
              listDrugPre.response.result[0].HisPackageRatio;
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
                  this.inputGroup.value.hn +
                  '|' +
                  dataQ +
                  '|';

                codeArr.push(data);
                this.value[i].Qty = this.value[i].Qty - 400;
              } while (this.value[i].Qty > 400);
            }

            j++;

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
              this.value[i].Qty +
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
          }

          codeArrPush.push(this.value[i]);
        }
      }
    }
    let DataJV: any = null;
    // let DataJV2: any = null;
    // let DataFinal: any = [];

    if (codeArr.join('\r\n') != '') {
      DataJV = codeArr.join('\r\n');
    }
    let op = [];
    for (let i = 0; i < codeArrSE.length; i++) {
      op.push(codeArrSE[i]);
    }

    op.push(arrSE.concat(codeArrPush));

    // op.forEach((element,i) => {
    //        let value = {
    //     drug: element[i],
    //   };
    //   this.value2.push(value);
    // });

    let getDataJV: any = null;
    let getDataDIH: any = null;
    let value2 = [];
    let dih = 1;
    let jvm = 1;
    for (let i = 0; i < op.length; i++) {
      for (let j = 0; j < op[i].length; j++) {
        let value = {
          drug: op[i][j],
        };
        value2.push(value);
      }
      let numRandom =
        '99' +
        Math.floor(Math.random() * 100000000) +
        '_' +
        Math.floor(Math.random() * 100);
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
            orderNo: numRandom,
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
      // console.log(xmlDrug);

      if (this.checkedDih == true) {
        let dataXml = { data: xmlDrug };
        getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);
      }

      if (getDataDIH.connect == true) {
        if (getDataDIH.response == 1) {
          dih = 1;
          // Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
        } else {
          dih = 2;
          // Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
        }
      } else {
        Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
      }
    }
    if (this.checkedJvm == true) {
      if (DataJV) {
        let dataJv = { data: DataJV };
        getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
        if (getDataJV.connect == true) {
          if (getDataJV.response == 1) {
            jvm = 1;
          } else if (getDataJV.response == 0) {
            jvm = 2;
          }
        } else {
          Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
        }
      }
    }

    if (
      (dih == 1 && jvm == 2) ||
      (dih == 2 && jvm == 1) ||
      (dih == 1 && jvm == 1)
    ) {
      Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    } else {
      Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    }
    let win: any = window;
    win.$('.modal-backdrop').remove();
    win.$('#myModal').modal('hide');

    // for (let index = 0; index < op.length; index++) {

    //   let value = {
    //     drug: op[index],
    //   };
    //   this.value2.push(value);
    // }

    // patName:
    // this.inputGroup.value.name.length > 30
    //   ? this.inputGroup.value.name.substring(0, 30) + '...'
    //   : this.inputGroup.value.name,

    // let a = 'พระครู ศีลคุณวิสุทธิ์ (ชูชีพ) กลิ่นจันทร์';
    // console.log(a.length);

    // let jsonDrug = {
    //   patient: {
    //     patID: this.inputGroup.value.hn,
    //     patName:
    //       this.inputGroup.value.name.length > 40
    //         ? this.inputGroup.value.name.substring(0, 37) + '...'
    //         : this.inputGroup.value.name,
    //     gender: this.selectedSex,
    //     birthday: this.birthDate,
    //     age: this.inputGroup.value.age,
    //     identity: '',
    //     insuranceNo: '',
    //     chargeType: '',
    //   },
    //   prescriptions: {
    //     prescription: {
    //       orderNo: numRandom,
    //       ordertype: 'M',
    //       pharmacy: 'OPD',
    //       windowNo: '',
    //       paymentIP: '',
    //       paymentDT: datePayment,
    //       outpNo: '',
    //       visitNo: '',
    //       deptCode: '',
    //       deptName: '',
    //       doctCode: '',
    //       doctName: '',
    //       diagnosis: '',
    //       drugs: this.value2,
    //     },
    //   },
    // };

    // let xmlDrug = JsonToXML.parse('outpOrderDispense', jsonDrug);

    // let getDataJV: any = null;
    // let getDataDIH: any = null;

    // if (this.checkedDih == true && this.checkedJvm == true) {
    //   if (DataJV) {
    //     let dataJv = { data: DataJV };
    //     getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    //   }

    //   let dataXml = { data: xmlDrug };
    //   getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

    //   if (getDataJV) {
    //     if (getDataJV.connect == true) {
    //       if (getDataJV.response == 1) {
    //         Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //         let win: any = window;
    //         win.$('.modal-backdrop').remove();
    //         win.$('#myModal').modal('hide');
    //       } else if (getDataJV.response == 0) {
    //         Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //       }
    //     } else {
    //       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //     }
    //   } else {
    //     if (getDataDIH.connect == true) {
    //       if (getDataDIH.response == 1) {
    //         Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //         let win: any = window;
    //         win.$('.modal-backdrop').remove();
    //         win.$('#myModal').modal('hide');
    //       } else {
    //         Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //       }
    //     } else {
    //       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //     }
    //   }
    // } else if (this.checkedDih == true && this.checkedJvm == false) {
    //   let dataXml = { data: xmlDrug };
    //   getDataDIH = await this.http.postNodejs('sendDIHOPD', dataXml);

    //   if (getDataDIH.connect == true) {
    //     if (getDataDIH.response == 1) {
    //       Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //       let win: any = window;
    //       win.$('.modal-backdrop').remove();
    //       win.$('#myModal').modal('hide');
    //     } else {
    //       Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //     }
    //   } else {
    //     Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //   }
    // } else if (this.checkedDih == false && this.checkedJvm == true) {
    //   if (DataJV) {
    //     let dataJv = { data: DataJV };
    //     getDataJV = await this.http.postNodejs('sendJVMOPD', dataJv);
    //     if (getDataJV.connect == true) {
    //       if (getDataJV.response == 1) {
    //         Swal.fire('ส่งข้อมูลเสร็จสิ้น', '', 'success');
    //         let win: any = window;
    //         win.$('.modal-backdrop').remove();
    //         win.$('#myModal').modal('hide');
    //       } else if (getDataJV.response == 0) {
    //         Swal.fire('ส่งข้อมูลไม่สำเร็จ', '', 'error');
    //       }
    //     } else {
    //       Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', '', 'error');
    //     }
    //   } else {
    //     Swal.fire('ข้อมูลไม่ถูกต้อง', '', 'error');
    //     let win: any = window;
    //     win.$('#myModal').modal('hide');
    //   }
    // }

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
