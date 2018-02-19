import { Component, AfterViewInit, OnInit} from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
declare var $: any;
declare var ga: Function;
// firebase
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html'
})
export class UserSettingsComponent implements AfterViewInit, OnInit {

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

    }

    ngOnInit() {
    }

    ngAfterViewInit() {
      $(document).ready(function () {

      });
    }


}
