import { Component, AfterViewInit, OnInit} from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from './services/google-analytics.service';
declare var $: any;
declare var ga: Function;
// firebase
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';
import { AngularFireList } from 'angularfire2/database/interfaces';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'Angular';
  user: any;
  username: string;
  items: AngularFireList<any>;
  msgVal = '';


  constructor(private authService: AuthService,
        private router: Router,
        public googleAnalyticsEventsService: GoogleAnalyticsService,
        public afAuth: AngularFireAuth, public af: AngularFireDatabase) {
        this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
            ga('set', 'page', event.urlAfterRedirects);
            ga('send', 'pageview');
        }
        });

        // firebase
        // this.items = af.list('/messages', {
        // query: {
        //     limitToLast: 50
        // }
        // });

        // this.user = this.authService.currentUser;
    }

    notificationPath() {

    }
    isLoggedIn() {
        return this.authService.isLoggedIn();
    }

    logout() {
        this.afAuth.auth.signOut();
    }

    Send(desc: string) {
        this.items.push({ message: desc });
        this.msgVal = '';
    }

    submitEvent() {
        this.googleAnalyticsEventsService.emitEvent('testCategory', 'testAction', 'testLabel', 10);
    }

    submitEventLogout(eventType: string) {
        this.googleAnalyticsEventsService.emitEvent('LogoutCategory', eventType, eventType, 10);
    }

    ngOnInit() {
        this.authService.afAuth.auth.onAuthStateChanged((user) => {
            if (user) {
            this.user = user;
            this.username = user.displayName || user.email.split('@')[0];
            }
        });
        // this.username = this.authService. useremail;
        // this.username = this.user.displayName || this.user.email;
    }

    ngAfterViewInit() {
      $(document).ready(function () {
          $('#linkLogin').click(function () {
              $('.navbar-collapse').collapse('hide');
          });
          $('#currentYear').text(new Date().getFullYear());

          $('.navbar-collapse').click('li', function () {
              $('.navbar-collapse').collapse('hide');
          });
          $('.navbar-collapse').blur(function () {
              $('.navbar-collapse').collapse('hide');
          });
      });
    }

    logoutOld() {
        this.authService.logout();
        this.submitEventLogout('LogOut');
        this.router.navigate(['/home']);
    }
}
