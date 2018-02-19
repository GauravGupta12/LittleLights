import { Component, AfterViewInit, OnInit, OnChanges, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
declare var ga: Function;
// firebase
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';
import { UserProfileService } from '../../services/user-profile.service';
import { User } from '../../models/user.model';
import { database } from 'firebase/app';
// image upload
import { ImageService } from '../../services/imageService';
import { GalleryImage } from '../../models/galleryImage.model';
import { Upload } from '../../models/upload.model';
import { UploadService } from '../../services/upload.service';
import * as _ from 'lodash';
import { UserNotificationService } from '../services/user-notifications.service';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
    @ViewChild('btnShowReachOutModal') btnShowReachOutModal: ElementRef;
    @ViewChild('modalReadReachOutMessage') modalReadReachOutMessage: ElementRef;
    @ViewChild('inpDetectDevice') inpDetectDevice: ElementRef;
    user: firebase.User;
    notifyBell = '';
    Bell = '';
    userModel: User;
    saveErrorMessage: string;
    myForm: FormGroup;
    dbUsername: string;
    userDisplayName: string;
    userPlace = '';
    userHobbies = '';
    userTagLine = '';
    userShortDescription = '';
    userPhotoURL = '';
    userEmail = '';
    userCreationTime = '';
    // image upload
    images: Observable<any[]>;
    files: FileList;
    upload: Upload;
    profilePicKey = '';
    gender = '';
    selectGender = '';
    dbEmail = '';
    myReachOutMessages: any;
    reachOutMsgToMe = '';
    reachOutMsgSender = '';
    reachOutMsgSenderUID = '';
    detectDevice = '';
    subscriptionNotifies: ISubscription;
    subscriptionROMessages: ISubscription;

    constructor(fb: FormBuilder, private authService: AuthService,
        private imgSvc: ImageService, private notifyService: UserNotificationService,
        private uploadSvc: UploadService,
        private usrProfileSvc: UserProfileService,
        private router: Router, private route: ActivatedRoute,
        public gaService: GoogleAnalyticsService,
        public afAuth: AngularFireAuth, public afdb: AngularFireDatabase) {
        this.router.events.subscribe(event => {

        if (event instanceof NavigationEnd) {
            ga('set', 'page', event.urlAfterRedirects);
            ga('send', 'pageview');
        }
        });

        this.user = this.authService.getCurrentUser();
        this.userPhotoURL = this.user.photoURL || '/assets/images/evening.jpg';
        this.userDisplayName = this.user.displayName || this.authService.registerUserName;
        this.userEmail = this.user.email;

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
        this.gender = this.authService.userGender;
        this.getUserDetailsFromFirebase();
        this.myForm = fb.group({
          'name': ['', Validators.required],
          'email': ['', Validators.required],
          'formgender': ['', Validators.required],
          'place': '',
          'hobbies': '',
          'tagLine': '',
          'shortDescription': '',
        });
    }

    uploadFiles() {
        const a = this.inpDetectDevice.nativeElement.value;
        const filesToUpload = this.files;
        const filesIdx = _.range(filesToUpload.length);
        _.each(filesIdx, (idx) => {
            // console.log(filesToUpload[idx]);
            this.upload = new Upload(filesToUpload[idx]);
            // this.profilePicKey = this.uploadSvc.uploadProfilePic(this.upload);
            const storageRef =  firebase.storage().ref();
            const uploadTask = storageRef.child('all-users/' + this.dbUsername + '/user-uploads/profile-pic/' + this.upload.file.name)
            .put(this.upload.file);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot) => {
                    this.upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
                },
                (error) => { // upload failed
                    // console.log(error);
                    alert('change picture failed');
                },
                () => {
                    this.upload.url = uploadTask.snapshot.downloadURL;
                    this.upload.name = this.upload.file.name;
                    this.profilePicKey = this.afdb.list('all-users/' + this.dbUsername + '/user-uploads/profile-pic').push(this.upload).key;
                    // this.updateUserDetails();
                    // if (this.profilePicKey) {
                    //     this.imgSvc.getProfilePic(this.profilePicKey)
                    //     .then( img => {
                    //         console.log(img);
                            this.userPhotoURL = uploadTask.snapshot.downloadURL;
                            this.updateProfile(this.userDisplayName, this.userPhotoURL)
                            .then( () => {
                                alert('Profile updated');
                                const updateProfileData = {
                                    dbUsername: this.dbUsername,
                                    photoURL : this.userPhotoURL,
                                    displayName : this.userDisplayName
                                };
                                const updates = {};
                                updates['/all-users/userUIDs/' + this.user.uid] = updateProfileData;
                                return firebase.database().ref().update(updates)
                                .then( (result) => {
                                    // console.log(result);
                                })
                                .catch( (error) => {
                                    // console.log(error);
                                });
                            });
                        // });
                    // }

                });
        });

    }

    handleFiles(event) {
        this.files = event.target.files;
    }
    updateUserDetails() {
        if (this.userDisplayName) {

            if (this.selectGender !== '') {
                this.gender = this.selectGender;
            }
            this.usrProfileSvc.updateUserDetails(this.profilePicKey, this.userDisplayName, this.user.uid, this.user.email,
                  this.userCreationTime, this.userPlace, this.userHobbies, this.userTagLine, this.gender,
                  this.userShortDescription, this.dbUsername)
            .then( () => {
                this.updateProfile(this.userDisplayName, this.userPhotoURL)
                .then( () => {
                    const item = {
                        dbUsername : this.dbUsername,
                        displayName : this.userDisplayName,
                        photoURL : this.userPhotoURL
                    };
                    const updates = {};
                    updates['/all-users/userUIDs/' + this.user.uid] = item;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const a = 5;
                        alert('Profile updated');
                    }).catch((error) => {
                           const b = 5;
                    });
                    // alert('Profile Updated');
                }).catch (() => {
                    alert('There is some error. Please try again !');
                });
            })
            .catch((error) => {
                alert('There is some error. Please try again !');
            });
        }
    }

    updateProfile(name: any, photoURL: any) {
        return this.authService.updateUserProfile(name, photoURL)
            .then( () => {
                this.userDisplayName = this.user.displayName;
                this.submitGAEvent();
            })
            .catch((error) => {
                this.saveErrorMessage = 'Incorrect credentials.';
                setTimeout(function () {
                    this.loginErrorMessage = '';
                }.bind(this), 2500);
            });
    }
    getUserDetailsFromFirebase() {
        firebase.database().ref('/all-users/' + this.dbUsername + '/user-profile/' + this.user.uid).once('value')
        .then( (snapshot) => {
            if (snapshot.val()) {
                this.userDisplayName =  snapshot.val().displayName;
                // this.userPhotoURL =  snapshot.val().photoURL || this.user.photoURL || '/assets/images/evening.jpg';
                this.userEmail =  snapshot.val().email;
                if (this.userEmail === 'twtr@#$123') {
                    this.userEmail = 'email';
                }
                this.userCreationTime =  snapshot.val().createdAt;
                this.userPlace =  snapshot.val().place || '';
                this.userTagLine =  snapshot.val().tagLine || '';
                this.userHobbies =  snapshot.val().hobbies || '';
                this.profilePicKey = snapshot.val().profilePicKey || '';
                this.gender = snapshot.val().gender || '';
                this.userShortDescription =  snapshot.val().shortDescription || '';
            }
          })
          .catch( (error) => {
               // console.log(error);
          });
    }
    cancelReachOutModal() {
        this.reachOutMsgToMe = '';
        this.reachOutMsgSender = '';
        this.reachOutMsgSenderUID = '';
    }
    goToFriendProfile() {
        this.reachOutMsgToMe = '';
        this.reachOutMsgSender = '';
        setTimeout( () => {
            this.router.navigate([`/dashboard/friend-profile/${this.reachOutMsgSenderUID}false`]);
       }, 100);

    }
    viewReachOutMessage(notifYInfo: any) {
        this.reachOutMsgToMe = notifYInfo.message;
        this.reachOutMsgSender = notifYInfo.authorName;
        this.reachOutMsgSenderUID = notifYInfo.authorUID;
        const creationDateAndTime = this.getCreationDate();

            notifYInfo.status = 'completed';
            notifYInfo.viewed = true;
            notifYInfo.viewedOn = creationDateAndTime;
            notifYInfo.viewedOnServerTime = firebase.database.ServerValue.TIMESTAMP;
            // ----------------------------------------------
        const updateNotify = {};
        updateNotify['/all-users/' + this.dbUsername + '/all-reachOutMessages/' + notifYInfo.reachOutMsgKey] = notifYInfo;
        firebase.database().ref().update(updateNotify)
        .then( () => {
                this.notifyBell = '';
                this.btnShowReachOutModal.nativeElement.click();
        }).catch((errorN) => {
        // console.log(errorN);
        });
    }
    getMyReachOutMsgs() {
       this.subscriptionROMessages = this.afdb.list('/all-users/' + this.dbUsername + '/all-reachOutMessages/',
       ref => ref.orderByChild('rechoutMsgNumber')).valueChanges()
        .subscribe( (data) => {
            this.myReachOutMessages = data;
            // this.notifyBell = 'newNotiFies';
            data.forEach( (item: any) => {
                if (item.status === 'pending') {
                    this.notifyBell = 'newNotiFies';
                    const audioIPhone = new Audio();
                    audioIPhone.src = '../../../assets/audio/what-friends-are-for.m4r';
                    audioIPhone.load();
                    audioIPhone.play();
                } else {
                    this.notifyBell = '';
                }
                const b = 5;
            });
        });
    }
    ngOnInit() {
        this.getUserDetailsFromFirebase();
        this.getMyReachOutMsgs();

        const paramIDForVisitor = this.route.snapshot.params['id'];
        if (paramIDForVisitor) {
            const visitorref = firebase.database().ref('/all-users/' + paramIDForVisitor).once('value')
            .then(function(snapshot) {
                const useridExists = (snapshot.val() !== null);
                // ...
              });
        }
    }
    ngOnChanges() {
        this.getUserDetailsFromFirebase();

        const paramIDForVisitor = this.route.snapshot.params['id'];
        if (paramIDForVisitor) {
            const visitorref = firebase.database().ref('/all-users/' + paramIDForVisitor).once('value')
            .then(function(snapshot) {
                const useridExists = (snapshot.val() !== null);
                // ...
              });
        }
    }
    ngOnDestroy() {
        this.subscriptionROMessages.unsubscribe();
        // alert('alert from ngOnDestroy.');
    }
    ngAfterViewInit() {
        $(document).ready(function () {

            function iOS() {
                const iDevices = [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod'
                ];
                if (navigator.platform) {
                    while (iDevices.length) {
                        if (navigator.platform === iDevices.pop()) {
                            $('#inpDetectDevice').val('true');
                            return true;
                        }
                    }
                }
                $('#inpDetectDevice').val('false');
                return false;
            }
            const isDeviceIOS = iOS();
            // alert('device is iOS : ' + isDeviceIOS);

            if ($(window).width() < 768) {
                $('#divProfileContent2').removeClass('profile-left-margin');
            } else {
                $('#divProfileContent2').addClass('profile-left-margin');
            }

            if ($(window).width() < 768) {
                $('#divUserProfile').addClass('user-post-margin');
            } else {
                $('#divUserProfile').removeClass('user-post-margin');
            }
            $(window).resize(function() {
                $('imgProfilePic').width( $(window).width() * 0.2 );
                $('imgProfilePic').height( $(window).height() * 0.2 );
            });

            // image upload
            $('#btnChangeProfilePic').bind('click', function () {
                $('#inputFiles').val('');
                $('#divChangeProfilePic').css('display', 'inline');
            });
            $('#btnUploadFiles').bind('click', function () {
                $('#inputFiles').val('');
                $('#divChangeProfilePic').css('display', 'none');
            });
            $('#btnCancelUpload').bind('click', function () {
                $('#inputFiles').val('');
                $('#divChangeProfilePic').css('display', 'none');
            });
            $('#inputFiles').bind('change', function () {
                const value = $(this).val();
                if (value !== '') {
                   $('#btnUploadFiles').css('display', 'inline');
                } else {
                   $('#btnUploadFiles').css('display', 'none');
                }
            });
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
    submitGAEvent() {
      this.gaService.emitEvent('ProfileUpdate', 'ProfileUpdate', 'ProfileUpdate', 10);
    }
}


// this.user = this.authService.user;
// this.displayName = this.user.displayName || this.authService.registerUserName;
// this.email = this.user.email;
// this.emailVerified = this.user.emailVerified;
// this.photoURL = this.user.photoURL || '/assets/images/evening.jpg';
// this.isAnonymous = this.user.isAnonymous;
// this.uid = this.user.uid;
// this.providerData = this.user.providerData;
