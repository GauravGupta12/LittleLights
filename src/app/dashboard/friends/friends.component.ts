import { Component, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
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
import { AngularFireList } from 'angularfire2/database/interfaces';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-user-friends',
  templateUrl: './friends.component.html'
})
export class UserFriendsComponent implements AfterViewInit, OnInit, OnDestroy {
    user: any;
    displayName: any;
    dbUsername: string;
    myFriends: Observable<any[]>;
    dbEmail = '';
    subscriptionFriends: ISubscription;

    constructor(private authService: AuthService,
          private router: Router,
          public gaService: GoogleAnalyticsService,
          public afAuth: AngularFireAuth, public afdb: AngularFireDatabase) {
      this.router.events.subscribe(event => {
       if (event instanceof NavigationEnd) {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      });
        this.user = this.authService.getCurrentUser();
        if (this.user.email) {
            this.dbEmail = this.user.email;
            do {
                this.dbEmail = this.dbEmail.replace('.', '');
            }
            while (this.dbEmail.includes('.'));
        }
        this.user.providerData.forEach( (p) => {
            if ( p.providerId === 'twitter.com') {
                this.dbUsername = 'twtr' + this.user.uid;
            } else {
                this.dbUsername = this.dbEmail + this.user.uid.substr(0, 12);
                if (this.dbUsername.includes('.')) {
                    this.dbUsername.replace('.', '');
                    // console.log(this.dbUsername + ' from constructor');
                }
            }
        });

      this.displayName = this.user.displayName || this.authService.registerUserName;

      firebase.database().ref(`all-users/${this.dbUsername}/user-friends/`).once('value', snapshot => {
        const exists = snapshot.val();
        if (exists) {
            // console.log('user exists!');
        } else {
            }
        });
    }

    addNewFriends(form: any) {
        const date = new Date().toDateString();
        this.authService.db.list('/all-users/' + this.dbUsername + '/user-friends/').push({
            name : 'Bruce Wayne',
            image : '/assets/images/batman.jpg',
            description : 'This is Batman.'
        });
    }
    ngOnDestroy() {
        this.subscriptionFriends.unsubscribe();
        // alert('alert from ngOnDestroy.');
    }

    ngOnInit() {
        this.myFriends = this.afdb.list('/all-users/' + this.dbUsername + '/user-friends/').valueChanges();
        this.subscriptionFriends = this.myFriends.subscribe((_items) => {
            _items.forEach((item) => {
                let authorLatestPic = '';
                let authorLatestName = '';
                let picOrNameChanged = false;
                firebase.database().ref('/all-users/userUIDs/' + item.friendUID).once('value')
                .then( (snapshot) => {
                    if (snapshot.val()) {
                        authorLatestPic = snapshot.val().photoURL;
                        authorLatestName = snapshot.val().displayName;
                        if (item.profilePic !== authorLatestPic) {
                            item.profilePic = authorLatestPic;
                            picOrNameChanged = true;
                        }
                        if (item.friendName !== authorLatestName) {
                            item.friendName = authorLatestName;
                            picOrNameChanged = true;
                        }
                        if ( picOrNameChanged ) {
                             const updates = {};
                             updates['/all-users/' + this.dbUsername + '/user-friends/' + item.friendUID] = item;
                             firebase.database().ref().update(updates)
                             .then(() => {
                                 const a = 5;
                             }).catch((error) => {
                                    const b = 5;
                             });
                             picOrNameChanged = false;
                        }
                    } else {
                        const a = 5;
                    }
                  });
            });
         });
    }

    ngAfterViewInit() {
      $(document).ready(function () {

        if ($(window).width() < 768) {
            $('#divUserFriends').addClass('user-post-margin');
        } else {
            $('#divUserFriends').removeClass('user-post-margin');
        }

      });
    }
    submitGAEvent() {
        this.gaService.emitEvent('Friend', 'Friend', 'Friend', 10);
    }


}
