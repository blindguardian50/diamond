

 import {Injectable} from '@angular/core';
 import {BehaviorSubject} from 'rxjs';

 @Injectable()
 export class DataService{

   //private messageSource = new BehaviorSubject<string>("DBF another test message");
   private messageSource = new BehaviorSubject<Array<string>>(["one","two","three"]);
   currentMessage = this.messageSource.asObservable();

   constructor() {}

  changeMessage(message: Array<string>){
    this.messageSource.next(message)
  }   
   
  //  changeMessage(message: string){
  //    this.messageSource.next(message)
  //  } 

}