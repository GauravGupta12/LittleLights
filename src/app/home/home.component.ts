import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import {AuthService} from '../core/auth.service';
import { auth } from 'firebase/app';
import * as firebase from 'firebase/app';
import { Browser, Window } from 'selenium-webdriver';
import { Observable } from 'rxjs/Observable';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit  {

      name = 'This is Home';
      displayName = '';
      user: any;
      browserInfo: any;
      http: Http;
      IppDetails: any;
      errorMessage: any;
      ipResult: any;
      ipdetails: any;
      constructor(private router: Router, public authService: AuthService) {
            this.user = firebase.auth().currentUser;
            if (this.user) {
              this.displayName = this.user.displayName;
            }
            this.browserInfo = window.navigator.platform;
            // console.log(window);
            const info = {
              browser: this.browserInfo,
              time: firebase.database.ServerValue.TIMESTAMP,
              actualTime : this.getCreationDate()
            };
            firebase.database().ref('all-visitHome/').push(info);

            // this.getIP();
      }
      getCreationDate() {
        const today = new Date();
        const d = today.toDateString().substr(4, 11).split(' ');
        const day = d[1].startsWith('0') ? d[1].charAt(1) : d[1];
        const hours = today.toLocaleString().split(' ')[1].split(':')[0];
        const mins = today.toLocaleString().split(' ')[1].split(':')[1];
        const AM_PM = today.toLocaleString().split(' ')[2];
        const date =  d[0] + ' ' + day + ', ' + d[2] +  ' at ' + hours +
                     ':' + mins + ' ' + AM_PM;
        return date;
    }
      // getIPService(): Observable<any> {
      //   return this.http.get('http://ipinfo.io') // ...using post request
      //   .map((res: Response) => {
      //     this.ipResult = res.json();
      //   });
      // }
      // getIP() {
      //   this.getIPService()
      //   .subscribe(
      //       IPDetails => {
      //         this.ipdetails = this.IppDetails;
      //       },
      //       error =>  this.errorMessage = <any>error
      //       );
      // }
      login() {
          this.router.navigate(['/login']);
      }
      ngAfterViewInit() {
        $(document).ready( function() {

      });
    }
}
