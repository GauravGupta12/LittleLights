import {Component, OnInit, Injectable} from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import * as firebase from 'firebase';
import { AuthService } from '../../core/auth.service';
import { AngularFireList } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class UserNotificationService implements OnInit {
    user: any;
    // dbUsername: string;
    userAllNotifications: Observable<any[]>;

    constructor(private afdb: AngularFireDatabase, private authService: AuthService) {
        // this.dbUsername = this.authService.authDbUsername;
        this.user = this.authService.getCurrentUser();
        // this.user.providerData.forEach( (p) => {
        //     if ( p.providerId === 'twitter.com') {
        //         // this.dbUsername = 'twtr' + this.user.uid;
        //     } else {
        //         // this.dbUsername = this.user.email.replace('.', '') + this.user.uid.substr(0, 12);
        //     }
        // });
    }
    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        // this.user.providerData.forEach( (p) => {
        //     if ( p.providerId === 'twitter.com') {
        //         // this.dbUsername = 'twtr' + this.user.displayName.replace(' ', '');
        //     } else {
        //         // this.dbUsername = this.user.email.replace('.', '');
        //     }
        // });
    }
    sendMarkFabCommentNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'fabMe-comment',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has marked your comment Favorite',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendInsterestingCommentNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'insteresting-comment',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has marked your comment Interesting',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendAppreciateCommentNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'appreciate-comment',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has appreciated your comment',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendInspiringCommentNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'inspiring-comment',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' is inspired by your comment.',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendMarkFabNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'fabMe-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has marked your story Favorite',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendSympathisingStoryNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'sympathise-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has sympathised you for your story',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendInsterestingStoryNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'insteresting-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has marked your story Interesting',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendAppreciateStoryNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'appreciate-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has appreciated your story',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendEnlightenStoryNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'enlighten-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has enlightened your story',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendInspiringStoryNofcn(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'inspiring-story',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' is inspired by your story.',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendStoryAddToColNofcn(post_authorDBUsername: string, postUID: string, gender: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'added-To-Collection',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has added your story to ' + gender + ' collection',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendCommentNotification(post_authorDBUsername: string, postUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + post_authorDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'post-comment',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' commented on your story',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : postUID,
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + post_authorDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        return firebase.database().ref().update(updateNotify);
    }
    sendFrndRqstNotification(friendDBUsername: string, friendUID: string, actualUser: any, actualDBUsername: any) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + friendDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            type: 'friend-request',       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : actualUser.displayName + ' has sent you friend request',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : actualUser.uid,
            authorDBUsername : actualDBUsername,
            authorPic : actualUser.photoURL,
            authorName : actualUser.displayName,
            postUID : '',
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + friendDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        updateNotify[`all-users/${actualDBUsername}/pending-requests/friend-request/${friendUID}`] = {
                                                                            isPending : true, notificationKey: newNotificationKey};
        return firebase.database().ref().update(updateNotify);
    }
    getUserNotications(actualDBUsername: string) {
        // const refNotify = firebase.database().ref('/all-users/' + actualDBUsername + '/all-notifications/')
        //                                     .orderByChild('status').equalTo('pending');
        // if (firebase.auth().currentUser) {
        //      refNotify.on('value', (snapshot) => {
        //         if (snapshot.val()) {
        //             return this.userAllNotifications = snapshot.val();
        //         }
        //     });
        // } else {
        //     refNotify.off();
        // }
        return this.userAllNotifications = this.afdb.list('/all-users/' + actualDBUsername + '/all-notifications/',
        ref => ref.orderByChild('status').equalTo('pending')).
        valueChanges();
    }
    sendRequestConfirmNotifcation(friendDBUsername: string, friendUID: string, currentUser: any, currentUser_dbUsername: string) {
        const creationDateAndTime = this.getCreationDate();
        const newNotificationKey = firebase.database().ref().child('/all-users/' + friendDBUsername + '/all-notifications')
        .push().key;
        const newNotificationData = {
            notificationUID : newNotificationKey,
            // type : post-comment, post-like, post-fabMe, post-enlighten, friend-request, friend-request-accepted
            type: 'friend-request-accepted',
            text : currentUser.displayName + ' has accepted your friend request',
            status : 'pending',  // pending or completed
            time : firebase.database.ServerValue.TIMESTAMP,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : creationDateAndTime,
            authorUID : currentUser.uid,
            authorDBUsername : currentUser_dbUsername,
            authorPic : currentUser.photoURL,
            authorName : currentUser.displayName,
            postUID : '',
            viewed : false,
            viewedOn : '',
            viewedOnServerTime : ''
        };
        const updateNotify = {};
        updateNotify['/all-users/' + friendDBUsername + '/all-notifications/' + newNotificationKey] = newNotificationData;
        updateNotify[`all-users/${friendDBUsername}/pending-requests/friend-request/${currentUser.uid}`] = null;
        return firebase.database().ref().update(updateNotify);
    }
    changeNotificationStatus(info: any, dbUsername: string) {
        const creationDateAndTime = this.getCreationDate();
        const changeNotificationData = {
            notificationUID : info.notificationUID,
            type: info.type,       // post-comment, post-like, post-fabMe, post-enlighten, friend-request
            text : info.text,
            status : 'completed',  // pending or completed
            time : info.time,
            NotificationNumber : 9999999999999999 - new Date().getTime(),
            createdAt : info.createdAt,
            authorUID : info.authorUID,
            authorDBUsername : info.authorDBUsername,
            authorPic : info.authorPic,
            authorName : info.authorName,
            postUID : info.postUID,
            viewed : true,
            viewedOn : creationDateAndTime,
            viewedOnServerTime : firebase.database.ServerValue.TIMESTAMP
        };
        const updateNotify = {};
        updateNotify['/all-users/' + dbUsername + '/all-notifications/' + info.notificationUID] = changeNotificationData;
        return firebase.database().ref().update(updateNotify);
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
