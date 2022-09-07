import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { UserService } from '../user.service';
import { AuthenticationService } from '../authentification.service';

import { Router, ActivatedRoute } from '@angular/router';

import { saveAs } from 'file-saver'

declare var $: any;

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css', '../app.component.css']
})
export class TestsComponent implements OnInit {
  tests;
  results = [];
  deleteTestId;
  baseurl = "";
  showModal = false;
  //number of participants for each study
  numberParticipants = [];
  constructor(private http: HttpClient, private userService: UserService, public authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();
    this.baseurl = location.origin;
    this.getAllTests(); 
    
  }

  getAllTests() {
    const data = {
        user: JSON.parse(localStorage.getItem('currentUser')).email
    };
    
    this.getTestData(data)
    .subscribe(
      res => {
        this.tests = res;
        this.setNumberOfParticipants();
      },
      err => {
      }
    );
  }

  copyToClipboard(studyId) {

    $('#copyboardtest').append('<textarea id="copyboard"></textarea>');
    $('#copyboard').val(this.baseurl + "/#/test/" + studyId);

    const input = document.getElementById('copyboard');
    const isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

    if (isiOSDevice) {

      const editable = input.contentEditable;
      const readOnly = (<any>input).readOnly;

      (<any>input).contentEditable = true;
      (<any>input).readOnly = false;

      const range = document.createRange();
      range.selectNodeContents(input);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      (<any>input).setSelectionRange(0, 999999);
      input.contentEditable = editable;
      (<any>input).readOnly = readOnly;

    } else {
      (<any>input).select();
    }
    document.execCommand('copy');
    $('#copyboard').remove();

  }

  getTestData(object) {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
  //http://localhost:48792
    return this.http.post(this.userService.serverUrl + '/users/test/getbyuserid', object, httpOptions);
  }

  getLink(id) {
    return this.baseurl + "/#/test/" + id;
  }

  launchTest(studyId, preview?) {
    const data = {
      id: studyId,
      launched: true,
      lastLaunched: new Date()
  };
    this.editTest(data)
    .subscribe(
      res => {
        this.getAllTests();
        if (preview) {
          this.router.navigate(['test/' + studyId]);
        }
      },
      err => {
        alert('An error occured. Please try again later.');
      }
    );
  }

  stopTest(studyId) {
    let date = new Date();
    const data = {
      id: studyId,
      launched: false,
      lastEnded: new Date()
    };
    this.editTest(data)
    .subscribe(
      res => {
        this.getAllTests();
      },
      err => {
        alert('An error occured. Please try again later.');
      }
    );
  }

  prepareDeleteStudy() {
    this.deleteStudy()
    .subscribe(
      res => {
        this.getAllTests();
        $("#myModal").modal('hide');
      },
      err => {
        $("#myModal").modal('hide');
        alert('An error occured. Please try again later.');
      }
    );
  }

  deleteStudy() {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
  //http://localhost:48792
    return this.http.post(this.userService.serverUrl + '/users/test/delete', {id: this.deleteTestId}, httpOptions);
  }

  editTest(data) {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
  //http://localhost:48792
    return this.http.post(this.userService.serverUrl + '/users/test/edit', data, httpOptions);
  }

  export(studyId){
  let test = this.tests.find(test => test._id === studyId);
  let id = test.id;
  let file;
  this.resultsInformation(id)
        .subscribe(
          res => {
            this.results = (<any>res).result;
            for (let i = 0; i < this.results.length; i++) {
              this.results[i]["exclude"] = false;
            }
            file = {...test, tests : this.results};
            this.downloadFile(file, id);
            console.log(file);
          },
          err => {
            console.log(err);
          }
        );
  }

  private downloadFile(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    saveAs(blob, `study-${fileName}.json`);
  }


  resultsInformation(id) {
    /*const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});*/
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
  };
  // return this.http.post('http://localhost:48792/users/results/' + 
    return this.http.post(this.userService.serverUrl + '/users/results/' + id, "", httpOptions);
  }

  setNumberOfParticipants(){
    let obj;
    this.numberParticipants = [];
    for(let test of this.tests){
      let number = 0;
      let id = test["id"];
      console.log('test id ', id);
      this.resultsInformation(id)
        .subscribe(
          res => {
            let results = (<any>res).result;
            for (let i = 0; i < results.length; i++) {
              number ++;
            }
            obj = {id: id, participants: number}
            this.numberParticipants.push(obj)
          },
          err => {
            console.log(err);
          }
        );
    }
  }
  

  onFileSelect(input) {

    const files = input.files;
    
    // var content = this.csvContent;    
    if (files && files.length) {

      const fileToRead = files[0];
      let extension = fileToRead.name.split(".");
      if (extension[extension.length -1] !== "json") {
        alert("File extension is wrong! Please provide .json file.");
        return;
      }

      const fileReader = new FileReader();
      let json = null;
      fileReader.onload = (e) => {
        json = JSON.parse(e.target.result.toString());
        //console.log(json);
        const randomStudyId = Math.random().toString(36).substring(2, 15);
        let launchable: boolean = json["tasks"].length > 0 ? true : false; 
        const study = {
          name: json["name"],
          launched: false,
          password: json["password"],
          id: randomStudyId,
          tree: json["tree"],
          tasks: json["tasks"],
          user: JSON.parse(localStorage.getItem('currentUser')).email,
          welcomeMessage: json["welcomeMessage"],
          instructions: json["instructions"],
          thankYouScreen: json["thankYouScreen"],
          leaveFeedback: json["leaveFeedback"],
          leafNodes: json["leafNodes"],
          orderNumbers: json["orderNumbers"],
          lastEnded: new Date(),
          lastLaunched: new Date(),
          isLaunchable: launchable
      };

      this.postStudyData(study)
      .subscribe(
        res => {
          $("#success").modal('show');
        },
        err => {
          alert("Error: " + err);
          console.log(err);
        }
      );
      for(let test of json["tests"]){
        const temp = {
          id: randomStudyId,
          results: test["results"],
          finished: test["finished"],
          username: test["username"],
          timestamp: test["timestamp"],
          feedback: test["feedback"]
        };
        //console.log(temp);
        this.postTestData(temp)
          .subscribe(
            res => {
              console.log(res);
            },
            err => {
              console.log(err);
            }
          );
      }
        
      // console.log(study);
      this.getAllTests();
      };
      fileReader.readAsText(input.files[0]);
      
    }
  }

  postStudyData(object) {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
    };
    //return this.http.post('http://localhost:48792/users/test/add', object,
    return this.http.post(this.userService.serverUrl + '/users/test/add', object, httpOptions);
  }

  postTestData(object) {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
    };
    //http://localhost:48792
    return this.http.post(this.userService.serverUrl + '/users/results/add', object, httpOptions);
  }

  

}

