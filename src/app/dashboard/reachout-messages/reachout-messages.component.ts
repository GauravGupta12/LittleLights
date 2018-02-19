import {Component, OnInit,  ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ImageService } from '../../services/imageService';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../core/auth.service';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
declare var $: any;
declare var ga: Function;
// firebase
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AngularFireList } from 'angularfire2/database/interfaces';


@Component({
    selector: 'app-reachout-messages',
    templateUrl: './reachout-messages.component.html'
})
export class ReachOutMessageComponent implements OnInit, AfterViewInit {
    user: any;
    displayName: any;
    dbUsername: string;
    noReachOutMessage = '';
    allReachOutMessages: Observable<any[]>;
    dbEmail = '';
    reachOutMsgToMe = '';
    reachOutMsgSender = '';
    reachOutMsgDBUsername = '';
    reachOutMsgSenderUID = '';
    messageID = '';
    reachOutMsg = '';
    @ViewChild('btnShowReachOutModal') btnShowReachOutModal: ElementRef;
    @ViewChild('btnCreateModal') btnCreateModal: ElementRef;

    constructor(private imgSvc: ImageService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private afdb: AngularFireDatabase,
                private router: Router) {

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
    }
    // -------------------------------------------------------------------------------------------------------
    cancelReachOut() {
        this.reachOutMsg = '';
        this.reachOutMsgToMe = '';
        this.reachOutMsgSender = '';
        this.reachOutMsgSenderUID = '';
        this.messageID = '';
        this.reachOutMsgDBUsername = '';
    }
    initiateReplyMessage(notifYInfo: any) {
        this.reachOutMsgToMe = notifYInfo.message;
        this.reachOutMsgSender = notifYInfo.authorName;
        this.reachOutMsgSenderUID = notifYInfo.authorUID;
        this.reachOutMsgDBUsername = notifYInfo.authorDBUsername;
        this.btnCreateModal.nativeElement.click();
    }
    reachOutToFriend() {
        if (this.reachOutMsg) {
            const creationDateAndTime = this.getCreationDate();
            const newReachOutMsgKey = firebase.database().ref().
            child(`/all-users/'${this.reachOutMsgDBUsername}'/all-reachOutMessages`).push().key;
            const newMsgData = {
                reachOutMsgKey : newReachOutMsgKey,
                text : this.user.displayName + ' has sent a message to you',
                message : this.reachOutMsg,
                status : 'pending',
                time : firebase.database.ServerValue.TIMESTAMP,
                createdAt : creationDateAndTime,
                authorUID : this.user.uid,
                rechoutMsgNumber : 9999999999999999 - new Date().getTime(),
                authorDBUsername : this.dbUsername,
                authorPic : this.user.photoURL,
                authorName : this.user.displayName,
                viewed : false,
                viewedOn : '',
                viewedOnServerTime : ''
            };
            const updates = {};
            updates[`/all-users/${this.reachOutMsgDBUsername}/all-reachOutMessages/${newReachOutMsgKey}`] = newMsgData;
            firebase.database().ref().update(updates)
            .then( () => {
                alert('Message sent');
                this.reachOutMsg = '';
            })
            .catch((error) => {
                this.reachOutMsg = '';
                // console.log(error);
            });
        }
    }
    viewReachOutMessage(notifYInfo: any) {
        this.reachOutMsgToMe = notifYInfo.message;
        this.reachOutMsgSender = notifYInfo.authorName;
        this.reachOutMsgSenderUID = notifYInfo.authorUID;
        // this.messageID = notifYInfo.reachOutMsgKey;
        this.btnShowReachOutModal.nativeElement.click();
    }
    cancelReachOutModal() {
        this.reachOutMsgToMe = '';
        this.reachOutMsgSender = '';
        this.reachOutMsgSenderUID = '';
        this.messageID = '';
    }
    goToFriendProfile() {
        this.reachOutMsgToMe = '';
        this.reachOutMsgSender = '';
        this.messageID = '';
        setTimeout( () => {
            this.router.navigate([`/dashboard/friend-profile/${this.reachOutMsgSenderUID}false`]);
       }, 100);

    }
    ngOnInit() {
        this.allReachOutMessages = this.afdb.list('/all-users/' + this.dbUsername + '/all-reachOutMessages/',
            ref => ref.orderByChild('rechoutMsgNumber')).valueChanges();
        this.allReachOutMessages.subscribe((_items) => {
            if (_items.length > 0) {
                this.noReachOutMessage = '';
                _items.forEach((item) => {
                    let authorLatestPic = '';
                    let authorLatestName = '';
                    let picOrNameChanged = false;
                    firebase.database().ref('/all-users/userUIDs/' + item.authorUID).once('value')
                    .then( (snapshot) => {
                        if (snapshot.val()) {
                            authorLatestPic = snapshot.val().photoURL;
                            authorLatestName = snapshot.val().displayName;
                            if (item.authorPic !== authorLatestPic) {
                                item.authorPic = authorLatestPic;
                                picOrNameChanged = true;
                            }
                            if (item.authorName !== authorLatestName) {
                                item.authorName = authorLatestName;
                                picOrNameChanged = true;
                            }
                            if ( picOrNameChanged ) {
                                 const updates = {};
                                 updates['/all-users/' + this.dbUsername + '/all-reachOutMessages/' + item.reachOutMsgKey] = item;
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
            } else {
                this.noReachOutMessage = 'You have no message. You may try to reach out to someone..';
            }
         });
    }
    ngAfterViewInit() {
        $(document).ready(function () {

            if ($(window).width() < 768) {
                $('#divAllReachOutMessages').addClass('user-post-margin');
            } else {
                $('#divAllReachOutMessages').removeClass('user-post-margin');
            }
        });
    }
    getCreationDate() {
        const today = new Date();
        const d = today.toDateString().substr(4, 11).split(' ');
        const hours = today.toLocaleString().split(' ')[1].split(':')[0];
        const mins = today.toLocaleString().split(' ')[1].split(':')[1];
        const AM_PM = today.toLocaleString().split(' ')[2];
        const date =  d[0] + ' ' + d[1] + ', ' + d[2] +  ' ' + hours +
                     ':' + mins + ' ' + AM_PM;
        return date;
    }
}
