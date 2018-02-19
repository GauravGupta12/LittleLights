import { Component, AfterViewInit, OnInit, ElementRef, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
declare var $: any;
declare var ga: Function;
// firebase
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import {  AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';
// pipes
import {FilterPipe} from '../../pipes/filter-posts.pipe';
import { UserNotificationService } from '../services/user-notifications.service';
import { Upload } from '../../models/upload.model';
import { UploadService } from '../../services/upload.service';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { Session } from 'selenium-webdriver';
import { Jsonp } from '@angular/http/src/http';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-my-stories',
  templateUrl: './my-stories.component.html'
})
export class MyStoriesComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {

    myForm: FormGroup;
    myEditPostForm: FormGroup;
    myCommentForm: FormGroup;
    user: any;
    Bell = '';
    dbUsername: string;
    queryString = '';
    myAllStories: Observable<any[]>;
    myAllNotifications: any;
    notifyBell = '';
    amazon = false;
    amazonEditPost = '';
    amazonComment = '';
    editPostModel: any;
    editCommentModel: any;
    postModelForEditingComment: any;
    stories_Comments: Observable<any[]>;
    hasAttachments = false;
    files: FileList;
    upload: Upload;
    newImageKey = '';
    newVideoKey = '';
    dbEmail = '';
    isFabMeComment = false;
    isInterestingComment = false;
    isAppreciateComment = false;
    isInspiringComment = false;
    isFabMeStory = false;
    isEnlightenedStory = false;
    isInspiringStory = false;
    isInterestingStory = false;
    isAppreciateStory = false;
    editPostContent = '';
    editPostTitle = '';
    isSympathisingStory = false;
    subscriptionNotifies: ISubscription;
    subscriptionPosts: ISubscription;

    constructor(private authService: AuthService,
        private notifyService: UserNotificationService,
            private fb: FormBuilder,
            private uploadSvc: UploadService,
            private elementRef: ElementRef,
            private router: Router,
            public gaService: GoogleAnalyticsService,
            public afAuth: AngularFireAuth, public afdb: AngularFireDatabase) {

                this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                    ga('set', 'page', event.urlAfterRedirects);
                    ga('send', 'pageview');
                }
                });
                this.myForm = fb.group({
                    'title': ['', Validators.required],   // N8bsVX4pYocILWa1TkZfgIBHkx83
                    'createdAt': firebase.database.ServerValue.TIMESTAMP,
                    'content': ['', Validators.required]
                });
                this.myEditPostForm = fb.group({
                    'title': [''],
                    'createdAt': firebase.database.ServerValue.TIMESTAMP,
                    'content': ['']
                });
                this.myCommentForm = fb.group({
                    'commentText': ['', Validators.required]
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
                        }
                    }
                });
    }
// --------------------------------------- comment features------------------------------------------------------
    checkCommentFeatureAvailable(comment: any, post: any) {
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/fabMeUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isFabMeComment = false;
            } else {
                this.isFabMeComment = true;
            }
        });
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/interestingUserCollection/${this.user.uid}`)
        .once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInterestingComment = false;
            } else {
                this.isInterestingComment = true;
            }
        });
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/appreciateUserCollection/${this.user.uid}`)
        .once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isAppreciateComment = false;
            } else {
                this.isAppreciateComment = true;
            }
        });
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/inspiredUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInspiringComment = false;
            } else {
                this.isInspiringComment = true;
            }
        });
    }
    markCommentfavorite(comment: any, post: any) {
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/fabMeUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
                if (!snapshot.val()) {
                    this.isFabMeComment = true;
                    comment.fabMeCommentCount = comment.fabMeCommentCount ? 1 + comment.fabMeCommentCount : 1;
                    const updates = {};
                    updates[`all-comments/${post.postUID}/${comment.commentUID}`] = comment;
                    updates[`all-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const updateFabMeCollection = {};
                        updateFabMeCollection[`all-comments/${post.postUID}/${comment.commentUID}/fabMeUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
                updateFabMeCollection[`all-posts/${post.postUID}/postComments/${comment.commentUID}/fabMeUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
            updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}` +
                        '/fabMeUserCollection/' + this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                        firebase.database().ref().update(updateFabMeCollection)
                        .then(() => {
                            if (comment.authorUID !== this.user.uid) {
                        this.notifyService.sendMarkFabCommentNofcn(comment.authorDBUsername, post.postUID, this.user, this.dbUsername);
                            }
                        })
                        .catch();
                    }).catch((error) => {
                    });
                } else {
                    alert('You have already marked it Favorite !');
                }
        });
    }
    markInterestingComment(comment: any, post: any) {
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/interestingUserCollection/${this.user.uid}`)
        .once('value')
        .then( (snapshot) => {
                if (!snapshot.val()) {
                    this.isInterestingComment = true;
                    comment.interestingCommentCount = comment.interestingCommentCount ? 1 + comment.interestingCommentCount : 1;
                    const updates = {};
                    updates[`all-comments/${post.postUID}/${comment.commentUID}`] = comment;
                    updates[`all-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const updateFabMeCollection = {};
                updateFabMeCollection[`all-comments/${post.postUID}/${comment.commentUID}/interestingUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
        updateFabMeCollection[`all-posts/${post.postUID}/postComments/${comment.commentUID}/interestingUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
        updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}` +
                        '/interestingUserCollection/' + this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                        firebase.database().ref().update(updateFabMeCollection)
                        .then(() => {
                            if (comment.authorUID !== this.user.uid) {
                        this.notifyService.sendInsterestingCommentNofcn(comment.authorDBUsername, post.postUID, this.user, this.dbUsername);
                            }
                        })
                        .catch();
                    }).catch((error) => {
                    });
                } else {
                    alert('You have already marked it Interesting !');
                }
        });
    }
    markInspiringComment(comment: any, post: any) {
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/inspiredUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
                if (!snapshot.val()) {
                    this.isInspiringComment = true;
                    comment.inspiringCommentCount = comment.inspiringCommentCount ? 1 + comment.inspiringCommentCount : 1;
                    const updates = {};
                    updates[`all-comments/${post.postUID}/${comment.commentUID}`] = comment;
                    updates[`all-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const updateFabMeCollection = {};
                        updateFabMeCollection[`all-comments/${post.postUID}/${comment.commentUID}/inspiredUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
            updateFabMeCollection[`all-posts/${post.postUID}/postComments/${comment.commentUID}/inspiredUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
            updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}` +
                        '/inspiredUserCollection/' + this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                        firebase.database().ref().update(updateFabMeCollection)
                        .then(() => {
                            if (comment.authorUID !== this.user.uid) {
                        this.notifyService.sendInspiringCommentNofcn(comment.authorDBUsername, post.postUID, this.user, this.dbUsername);
                        }
                        })
                        .catch();
                    }).catch((error) => {
                    });
                } else {
                    alert('You have already marked it Inspiring !');
                }
        });
    }
    appreciateComment(comment: any, post: any) {
        firebase.database().ref(`/all-comments/${post.postUID}/${comment.commentUID}/appreciateUserCollection/${this.user.uid}`)
        .once('value')
        .then( (snapshot) => {
                if (!snapshot.val()) {
                    this.isAppreciateComment = true;
                    comment.appreciateCommentCount = comment.appreciateCommentCount ? 1 + comment.appreciateCommentCount : 1;
                    const updates = {};
                    updates[`all-comments/${post.postUID}/${comment.commentUID}`] = comment;
                    updates[`all-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}`] = comment;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const updateFabMeCollection = {};
                    updateFabMeCollection[`all-comments/${post.postUID}/${comment.commentUID}/appreciateUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
            updateFabMeCollection[`all-posts/${post.postUID}/postComments/${comment.commentUID}/appreciateUserCollection/${this.user.uid}`]
                        = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
    updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/postComments/${comment.commentUID}` +
        '/appreciateUserCollection/' + this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                        firebase.database().ref().update(updateFabMeCollection)
                        .then(() => {
                            if (comment.authorUID !== this.user.uid) {
                        this.notifyService.sendAppreciateCommentNofcn(comment.authorDBUsername, post.postUID, this.user, this.dbUsername);
                        }
                        })
                        .catch();
                    }).catch((error) => {
                    });
                } else {
                    alert('You have already appreciated the comment !');
                }
        });
    }
    // ---------------------------------------- User Activities on story -------------------------------------------------
    checkFeatureAvailable(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/fabMeUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isFabMeStory = false;
            } else {
                this.isFabMeStory = true;
            }
        });
        firebase.database().ref(`/all-posts/${post.postUID}/sympathisedUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isSympathisingStory = false;
            } else {
                this.isSympathisingStory = true;
            }
        });
        firebase.database().ref(`/all-posts/${post.postUID}/interestingUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInterestingStory = false;
            } else {
                this.isInterestingStory = true;
            }
        });
        firebase.database().ref(`/all-posts/${post.postUID}/appreciateUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isAppreciateStory = false;
            } else {
                this.isAppreciateStory = true;
            }
        });
        firebase.database().ref(`/all-posts/${post.postUID}/inspiredUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInspiringStory = false;
            } else {
                this.isInspiringStory = true;
            }
        });
        firebase.database().ref(`/all-posts/${post.postUID}/enlightenedUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isEnlightenedStory = false;
            } else {
                this.isEnlightenedStory = true;
            }
        });
    }
    markStoryFavorite(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/fabMeUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
                if (!snapshot.val()) {
                    this.isFabMeStory = true;
                    post.fabMeStoryCount = post.fabMeStoryCount ? 1 + post.fabMeStoryCount : 1;
                    const updates = {};
                    updates[`all-posts/${post.postUID}`] = post;
                    updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        const updateFabMeCollection = {};
                        updateFabMeCollection[`all-posts/${post.postUID}/fabMeUserCollection/${this.user.uid}`] = {
                            userUID : this.user.uid, displayName : this.user.displayName
                        };
                        updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/fabMeUserCollection/` +
                                                    this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                        firebase.database().ref().update(updateFabMeCollection)
                        .then(() => {
                            if (post.authorUID !== this.user.uid) {
                                this.notifyService.sendMarkFabNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                        }
                        })
                        .catch();
                    }).catch((error) => {
                    });
                } else {
                    alert('You have already marked it Favorite !');
                }
        });

    }
    markStorySympathising(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/sympathisedUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isSympathisingStory = true;
                post.sympathisingStoryCount = post.sympathisingStoryCount ? 1 + post.sympathisingStoryCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateInspiredCollection = {};
                    updateInspiredCollection[`all-posts/${post.postUID}/sympathisedUserCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                    updateInspiredCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/sympathisedUserCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateInspiredCollection)
                    .then(() => {
                        const a = 5;
                        if (post.authorUID !== this.user.uid) {
                            this.notifyService.sendSympathisingStoryNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                       }
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already marked the story inspirational !');
            }
        });
        // inspiringStoryCount
    }
    markStoryInteresting(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/interestingUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInterestingStory = true;
                post.interestingStoryCount = post.interestingStoryCount ? 1 + post.interestingStoryCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateFabMeCollection = {};
                    updateFabMeCollection[`all-posts/${post.postUID}/interestingUserCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                    updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/interestingUserCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateFabMeCollection)
                    .then(() => {
                        if (post.authorUID !== this.user.uid) {
                            this.notifyService.sendInsterestingStoryNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                    }
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already marked it Interesting !');
            }
        });
    }
    appreciateStory(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/appreciateUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isAppreciateStory = true;
                post.appreciateStoryCount = post.appreciateStoryCount ? 1 + post.appreciateStoryCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateFabMeCollection = {};
                    updateFabMeCollection[`all-posts/${post.postUID}/appreciateUserCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                    updateFabMeCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/appreciateUserCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateFabMeCollection)
                    .then(() => {
                        if (post.authorUID !== this.user.uid) {
                            this.notifyService.sendAppreciateStoryNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                    }
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already appreciated the story !');
            }
        });
    }
    enlightenStory(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/enlightenedUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isEnlightenedStory = true;
                post.enlightenedStoryCount = post.enlightenedStoryCount ? 1 + post.enlightenedStoryCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateEnlightenCollection = {};
                    updateEnlightenCollection[`all-posts/${post.postUID}/enlightenedUserCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                updateEnlightenCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/enlightenedUserCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateEnlightenCollection)
                    .then(() => {
                        const a = 5;
                        if (post.authorUID !== this.user.uid) {
                            this.notifyService.sendEnlightenStoryNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                    }
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already enlightened the story !');
            }
        });
        // enlightenedStoryCount
    }
    storyInspiredMe(post: any) {
        firebase.database().ref(`/all-posts/${post.postUID}/inspiredUserCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isInspiringStory = true;
                post.inspiringStoryCount = post.inspiringStoryCount ? 1 + post.inspiringStoryCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateInspiredCollection = {};
                    updateInspiredCollection[`all-posts/${post.postUID}/inspiredUserCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                    updateInspiredCollection[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/inspiredUserCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateInspiredCollection)
                    .then(() => {
                        const a = 5;
                        if (post.authorUID !== this.user.uid) {
                            this.notifyService.sendInspiringStoryNofcn(post.authorDBUsername, post.postUID, this.user, this.dbUsername);
                    }
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already marked the story inspirational !');
            }
        });
    // inspiringStoryCount
    }

    // Notifications related methods ----------------------------fILE HANDLING METHODS ------------------------------------------

    uploadFiles() {
        const filesToUpload = this.files;
         if (filesToUpload[0].type.includes('video')) {
            if (filesToUpload[0].size <= 11534336) { // 10485760
                const filesIdx = _.range(filesToUpload.length);
                _.each(filesIdx, (idx) => {
                    // console.log(filesToUpload[idx]);
                    this.upload = new Upload(filesToUpload[idx]);
                    this.uploadSvc.uploadVideo(this.upload, this.dbUsername);
                });
            } else {
                alert('Maximum video size allowed is 10 MB.');
            }
         } else if (filesToUpload[0].type.includes('image')) {
            const filesIdx = _.range(filesToUpload.length);
            _.each(filesIdx, (idx) => {
                // console.log(filesToUpload[idx]);
                this.upload = new Upload(filesToUpload[idx]);
                this.uploadSvc.uploadImage(this.upload, this.dbUsername);
            });
         }
    }
    KeepFilesAtLocal(newPostKey: string, postTitle: string, postContent) {
        const filesToUpload = this.files;
        if (filesToUpload[0].type.includes('video')) {
           if (filesToUpload[0].size <= 11534336) { // 10485760
               const filesIdx = _.range(filesToUpload.length);
               _.each(filesIdx, (idx) => {
                this.upload = new Upload(filesToUpload[idx]);
                this.upload.postUID = newPostKey;
                const storageRef =  firebase.storage().ref();
                const uploadTask = storageRef.child(`all-users/${this.dbUsername}/user-uploads/videos/${this.upload.file.name}`)
                .put(this.upload.file);

                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                        (snapshot) => {
                        this.upload.progress = Math.floor((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);
                        },
                        (error) => { // upload failed
                            // console.log(error);
                        },
                        () => {
                            this.upload.url = uploadTask.snapshot.downloadURL;
                            this.upload.name = this.upload.file.name;
                            // ---------------------------------------------------
                            this.newVideoKey = firebase.database().ref()
                                        .child(`all-users/${this.dbUsername}/user-uploads/videos/`).push().key;
                            this.upload.key = this.newVideoKey;
                            const updates = {};
                            updates[`all-users/${this.dbUsername}/user-uploads/videos/` + this.newVideoKey] = this.upload;
                            firebase.database().ref().update(updates)
                            .then( () => {
                                const creationDateAndTime = this.getCreationDate();
                                const updatePostData = {
                                    title : postTitle,
                                    postUID : newPostKey,
                                    time : firebase.database.ServerValue.TIMESTAMP,
                                    createdAt: creationDateAndTime,
                                    postNumber: 9999999999999999 - new Date().getTime(),
                                    content : postContent,
                                    authorName : this.user.displayName,
                                    authorUID : this.user.uid,
                                    authorDBUsername : this.dbUsername,
                                    authorPic : this.user.photoURL,
                                    postComments : {},
                                    commentsCount : 0,
                                    lightsCount : 0,
                                    attachments : true,
                                    shareCount : 0,
                                    imageKey : '',  // saving url
                                    imageURL : '',  // saving url
                                    imageName : '',
                                    videoKey : this.newVideoKey,  // saving url
                                    videoURL : this.upload.url,  // saving url
                                    videoName : this.upload.file.name,
                                    isEdited: false,
                                    timeOfEditForServer: '',
                                    timeOfEdit: '',
                                };
                                // Write the new post's data simultaneously in the posts list and the user's post list.
                                const updatesVideo = {};
                                updatesVideo['/all-posts/' + newPostKey] = updatePostData;
                                updatesVideo['/all-users/' + this.dbUsername + '/user-posts/' + newPostKey] = updatePostData;
                                firebase.database().ref().update(updatesVideo)
                                .then( () => {
                                    this.hasAttachments = false;
                                    this.upload = null;
                                })
                                .catch((error) => {
                                    // console.log(error);
                                });
                            })
                            .catch((error) => {
                                // console.log(error);
                            });
                    });
               });
           } else {
               alert('Maximum video size allowed is 10 MB.');
           }
        } else if (filesToUpload[0].type.includes('image')) {
           const filesIdx = _.range(filesToUpload.length);
           _.each(filesIdx, (idx) => {
                this.upload = new Upload(filesToUpload[idx]);
                this.upload.postUID = newPostKey;
                const storageRef =  firebase.storage().ref();
                const uploadTask = storageRef.child(`all-users/${this.dbUsername}/user-uploads/images/${this.upload.file.name}`)
                .put(this.upload.file);

                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    (snapshot) => {
                        this.upload.progress = Math.floor((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);
                    },
                    (error) => { // upload failed
                        // console.log(error);
                    },
                    () => {
                        this.upload.url = uploadTask.snapshot.downloadURL;
                        this.upload.name = this.upload.file.name;
                        // ---------------------------------------------------
                        this.newImageKey = firebase.database().ref()
                                    .child(`all-users/${this.dbUsername}/user-uploads/images/`).push().key;
                        this.upload.key = this.newImageKey;
                        const updates = {};
                        updates[`all-users/${this.dbUsername}/user-uploads/images/` + this.newImageKey] = this.upload;
                        firebase.database().ref().update(updates)
                        .then( () => {
                            const creationDateAndTime = this.getCreationDate();
                            const updatePostData = {
                                title : postTitle,
                                postUID : newPostKey,
                                time : firebase.database.ServerValue.TIMESTAMP,
                                createdAt: creationDateAndTime,
                                postNumber: 9999999999999999 - new Date().getTime(),
                                content : postContent,
                                authorName : this.user.displayName,
                                authorUID : this.user.uid,
                                authorDBUsername : this.dbUsername,
                                authorPic : this.user.photoURL,
                                postComments : {},
                                commentsCount : 0,
                                lightsCount : 0,
                                attachments : true,
                                shareCount : 0,
                                imageKey : this.newImageKey,  // saving url
                                imageURL : this.upload.url,  // saving url
                                imageName : this.upload.file.name,
                                videoKey : '',  // saving url
                                videoURL : '',  // saving url
                                videoName : '',
                                isEdited: false,
                                timeOfEditForServer: '',
                                timeOfEdit: '',
                            };
                            // Write the new post's data simultaneously in the posts list and the user's post list.
                            const updatesImage = {};
                            updatesImage['/all-posts/' + newPostKey] = updatePostData;
                            updatesImage['/all-users/' + this.dbUsername + '/user-posts/' + newPostKey] = updatePostData;
                            firebase.database().ref().update(updatesImage)
                            .then( () => {
                                this.hasAttachments = false;
                                this.upload = null;
                            })
                            .catch((error) => {
                                // console.log(error);
                            });
                        })
                        .catch((error) => {
                            // console.log(error);
                        });
                });
           });
        }
    }
    addMediaforNewPost() {
        this.hasAttachments = true;
    }
    showAttachmentContainer() {
        this.hasAttachments = true;
    }
    handleFiles(event) {
        this.files = event.target.files;
    }

    // Story related methods ---------------------------- STORY METHODS ------------------------------------------

    deletePost(postUID: any, authorUID: any, imageKey: string, imageName: string, videoKey: string, videoName: string) {
        if (authorUID === this.user.uid) {
            const deleteConfirmation = confirm('Are you sure, want to delete the story ?');
            if (deleteConfirmation) {
                const updates = {};
                updates['/all-posts/' + postUID] = null;
                updates['/all-comments/' + postUID] = null;
                updates['/all-users/' + this.dbUsername + '/user-posts/' + postUID] = null;
                if (imageKey) {
                    updates['/all-users/' + this.dbUsername + '/user-uploads/images/' + imageKey] = null;
                }
                if (videoKey) {
                    updates['/all-users/' + this.dbUsername + '/user-uploads/videos/' + videoKey] = null;
                }
                firebase.database().ref().update(updates)
                .then( () => {
                    alert('Story Deleted');
                    if (imageKey) {
                        firebase.storage().ref().child(`all-users/${this.dbUsername}/user-uploads/images/${imageName}`).delete();
                    }
                    if (videoKey) {
                        firebase.storage().ref().child(`all-users/${this.dbUsername}/user-uploads/videos/${videoName}`).delete();
                    }
                })
                .catch((error) => {
                });
            }
        } else {
            alert('Not permitted');
        }
    }
    reseNewPostForm() {
        this.amazon = true;
        this.hasAttachments = false;
        this.editPostModel = null;
        this.myForm.controls['title'].reset();
        this.myForm.controls['content'].reset();
    }
    newPostFormCancel() {
        this.amazon = false;
        this.hasAttachments = false;
    }
    editPostFormCancel() {
        this.amazonEditPost = '';
        this.hasAttachments = false;
        this.editPostModel = null;
        this.myForm.controls['title'].reset();
        this.myForm.controls['content'].reset();
    }
    initiatePostEditing(post: any) {
        this.amazonEditPost = post.postUID;
        if (post.authorUID === this.user.uid) {
            this.editPostModel = post;
        } else {
            this.editPostModel = null;
            alert('Not permitted');
        }
    }
    editPost(editPostTitle: any, editPostContent: any ) {
        if (editPostTitle) {
            if (editPostContent) {
                this.amazonEditPost = '';
                    if (this.editPostModel.authorUID === this.user.uid) {
                        const creationDateAndTime = this.getCreationDate();
                        this.editPostModel.title = editPostTitle;
                        this.editPostModel.content = editPostContent;
                        this.editPostModel.isEdited = true;
                        this.editPostModel.timeOfEditForServer = firebase.database.ServerValue.TIMESTAMP;
                        this.editPostModel.timeOfEdit = creationDateAndTime;

                        const updates = {};
                        updates['/all-posts/' + this.editPostModel.postUID] = this.editPostModel;
                        updates['/all-users/' + this.dbUsername + '/user-posts/' + this.editPostModel.postUID] = this.editPostModel;
                        firebase.database().ref().update(updates)
                        .then( () => {
                            this.editPostModel = null;
                        })
                        .catch((error) => {
                        });
                    } else {
                    }
            } else {
                alert('The story doesn\'t have Content');
            }
        } else {
            alert('The story doesn\'t have a Title');
        }

    }
    createPost(form: any) {
        this.amazon = false;
        if (this.myForm.valid) {
            const creationDateAndTime = this.getCreationDate();

            // Get a key for a new Post.
            const newPostKey = firebase.database().ref().child('all-posts').push().key;
            const newPostData = {
                title : form.title,
                postUID : newPostKey,
                time : firebase.database.ServerValue.TIMESTAMP,
                createdAt: creationDateAndTime,
                postNumber: 9999999999999999 - new Date().getTime(),
                content : form.content,
                authorName : this.user.displayName,
                authorUID : this.user.uid,
                authorDBUsername : this.dbUsername,
                authorPic : this.user.photoURL,
                postComments : {},
                commentsCount : 0,
                lightsCount : 0,
                attachments : {},
                shareCount : 0,
                imageKey : '',  // saving url
                videoKey : '',  // saving url
                imageURL : '',  // saving url
                videoURL : '',  // saving url
                isEdited: false,
                timeOfEditForServer: '',
                timeOfEdit: '',
            };

            // Write the new post's data simultaneously in the posts list and the user's post list.
            const updates = {};
            updates['/all-posts/' + newPostKey] = newPostData;
            updates['/all-users/' + this.dbUsername + '/user-posts/' + newPostKey] = newPostData;
            firebase.database().ref().update(updates)
            .then( () => {
                if (this.hasAttachments) {
                    this.KeepFilesAtLocal(newPostKey, form.title, form.content);
                }
                this.hasAttachments = false;
            })
            .catch((error) => {
                // console.log(error);
            });
        }
    }

    // Comment related method ---------------------------- COMMENTS METHODS ------------------------------------------------------

    public getCommentsforPost(postUID: any) {
        this.stories_Comments = this.afdb.list('/all-comments/' + postUID).valueChanges();
        this.stories_Comments.subscribe((_items) => {
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
                                updates['/all-comments/' + item.postUID + '/' +  item.commentUID] = item;
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
    initiateCommentEditing(comment: any, post: any) {
        this.amazonComment = comment.commentUID;
        if (comment.authorUID === this.user.uid) {
            this.editCommentModel = comment;
            this.postModelForEditingComment = post;
        } else {
            this.editCommentModel = null;
            this.postModelForEditingComment = null;
            alert('Not permitted');
        }
    }
    cancelCommentEditing() {
        this.amazonComment = '';
        this.editCommentModel = null;
        this.postModelForEditingComment = null;
        this.myCommentForm.controls['commentText'].reset();
    }
    editComment(form: any) {
        this.amazonComment = '';
        if (this.myCommentForm.valid) {
            if (this.editCommentModel.authorUID === this.user.uid) {

                const creationDateAndTime = this.getCreationDate();
                this.editCommentModel.text = form.commentText;
                this.editCommentModel.isEdited = true;
                this.editCommentModel.timeOfEditForServer = firebase.database.ServerValue.TIMESTAMP;
                this.editCommentModel.timeOfEdit = creationDateAndTime;
                this.editCommentModel.commentUID = this.editCommentModel.commentUID;

                const updates = {};
                updates['/all-posts/' + this.postModelForEditingComment.postUID + '/postComments/' +
                 this.editCommentModel.commentUID] = this.editCommentModel;
                updates['/all-users/' + this.postModelForEditingComment.authorDBUsername + '/user-posts/' +
                 this.postModelForEditingComment.postUID + '/postComments/' + this.editCommentModel.commentUID] = this.editCommentModel;
                updates['/all-comments/' + this.postModelForEditingComment.postUID + '/' +
                                                             this.editCommentModel.commentUID] = this.editCommentModel;

                firebase.database().ref().update(updates)
                .then( () => {
                    this.editCommentModel = null;
                    this.postModelForEditingComment = null;
                })
                .catch((error) => {
                });
            } else {
            }
        }
    }
    deleteComment(comment: any, post: any) {
        if (comment.authorUID === this.user.uid) {
            const deleteConfirmation = confirm('Are you sure, want to delete the comment ?');
            if (deleteConfirmation) {
                const updates = {};
                updates['/all-posts/' + post.postUID + '/postComments/' + comment.commentUID] = null;
                updates['/all-users/' + post.authorDBUsername + '/user-posts/'
                            + post.postUID + '/postComments/' + comment.commentUID] = null;
                updates['/all-comments/' + post.postUID + '/' + comment.commentUID] = null;
                firebase.database().ref().update(updates)
                .then( () => {
                    const updateCommentCount = {};
                    updateCommentCount['/all-posts/' + post.postUID + '/commentsCount' ] = post.commentsCount - 1;
                    updateCommentCount['/all-users/' + post.authorDBUsername + '/user-posts/' + post.postUID + '/commentsCount']
                                                                                                = post.commentsCount - 1 ;
                    firebase.database().ref().update(updateCommentCount);
                })
                .catch((error) => {
                });
            }
        } else {
        }
    }
    postNewComment(commentVal: any, post: any) {
        this.saveComment(commentVal, post);
    }
    saveComment(commentVal: any, post: any) {
        // const val = commentVal;
        const creationDateAndTime = this.getCreationDate();
        const newCommentKey = firebase.database().ref().child('all-comments').push().key;
        const newCommentData = {
            commentUID : newCommentKey,
            text : commentVal,
            time : firebase.database.ServerValue.TIMESTAMP,
            createdAt : creationDateAndTime,
            authorUID : this.user.uid,
            authorDBUsername : this.dbUsername,
            authorPic : this.user.photoURL,
            authorName : this.user.displayName,
            postUID : post.postUID,
            isEdited: false,
            timeOfEditForServer: '',
            timeOfEdit: '',
            inspiringCommentCount: 0,
            appreciateCommentCount: 0,
            interestingCommentCount: 0,
            fabMeCommentCount: 0,
        };
        // Write the new post's data simultaneously in the posts list and the user's post list.
        const updates = {};
        updates['/all-posts/' + post.postUID + '/postComments/' + newCommentKey] = newCommentData;
        updates['/all-users/' + post.authorDBUsername + '/user-posts/' + post.postUID + '/postComments/' + newCommentKey] = newCommentData;
        updates['/all-comments/' + post.postUID + '/' + newCommentKey] = newCommentData;
        firebase.database().ref().update(updates)
        .then( () => {
            const updateCommentCount = {};
            updateCommentCount['/all-posts/' + post.postUID + '/commentsCount' ] = post.commentsCount + 1;
            updateCommentCount['/all-users/' + post.authorDBUsername + '/user-posts/' + post.postUID + '/commentsCount']
                                                                                         = 1 + post.commentsCount ;
            firebase.database().ref().update(updateCommentCount)
            .then( (result) => {
                if (this.user.uid !== post.authorUID) {
                    this.notifyService.sendCommentNotification(post.authorDBUsername, post.postUID, this.user, this.dbUsername)
                    .then( () => {
                            const a = 5;
                    }).catch((errorN) => {
                    });
                }
            })
            .catch( (errorNotification) => {
            });
        })
        .catch((error) => {
        });
    }

    // Notifications related methods ---------------------------- NOTIFICATIONS METHODS ------------------------------------------

    notifiesViewed(notifYInfo: any) {
        this.notifyBell = '';
        if (notifYInfo.status === 'pending') {
            switch (notifYInfo.type) {
                case 'friend-request':
                        const updateInfoFR = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoFR.then( () => {
                            this.router.navigate([`/dashboard/friend-profile/${notifYInfo.authorUID}true`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'friend-request-accepted':
                        const updateInfoFRC = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoFRC.then( () => {
                            this.router.navigate([`/dashboard/friend-profile/${notifYInfo.authorUID}true`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'post-comment':
                        const updateInfoPC = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoPC.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'fabMe-comment':
                        const updateInfoFabMeComment = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoFabMeComment.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'insteresting-comment':
                        const updateInfoInterestingComment = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoInterestingComment.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'appreciate-comment':
                        const updateInoAppreciateComment = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInoAppreciateComment.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'inspiring-comment':
                        const updateInfoInspiringComment = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoInspiringComment.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'fabMe-story':
                        const updateInfoFabMe = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoFabMe.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'sympathise-story':
                        const updateInfoSympathise = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoSympathise.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'insteresting-story':
                        const updateInfoInteresting = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoInteresting.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'appreciate-story':
                        const updateInoAppreciate = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInoAppreciate.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'enlighten-story':
                        const updateInfoEnlighten = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoEnlighten.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'inspiring-story':
                        const updateInfoInspiring = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoInspiring.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                case 'added-To-Collection':
                        const updateInfoAddToCol = this.notifyService.changeNotificationStatus(notifYInfo, this.dbUsername);
                        updateInfoAddToCol.then( () => {
                            this.router.navigate([`/dashboard/user-story/${notifYInfo.postUID}`]);
                        }).catch((errorN) => {
                        // console.log(errorN);
                        });
                    break;
                default:
                    break;
            }
        }
    }
    getAllNotications() {
        this.subscriptionNotifies = this.notifyService.getUserNotications(this.dbUsername).subscribe( (data) => {
            this.myAllNotifications = data;
            this.Bell = 'bell';
            setTimeout(() => {
                this.Bell = '';
            }, 1000);
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
    ngOnDestroy() {
        this.subscriptionNotifies.unsubscribe();
        this.subscriptionPosts.unsubscribe();
        // alert('alert from ngOnDestroy.');
    }

    // Notifications related methods ---------------------------- LIFE CYCLE HOOKS ----------------------------------------------

    ngOnInit() {
        this.myAllStories = this.afdb.list(`/all-users/${this.dbUsername}/user-posts/`,
        ref => ref.orderByChild('postNumber')).valueChanges(['child_added', 'child_changed', 'child_removed']);
        this.subscriptionPosts =  this.myAllStories.subscribe((_items) => {
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
                             updates[`/all-users/${this.dbUsername}/user-posts/` + item.postUID] = item;
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
        this.getAllNotications();
    }
    ngOnChanges() {
        this.myAllStories = this.afdb.list(`/all-users/${this.dbUsername}/user-posts/`,
        ref => ref.orderByChild('postNumber')).valueChanges(['child_added', 'child_changed', 'child_removed']);
        this.subscriptionPosts =  this.myAllStories.subscribe((_items) => {
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
                             updates[`/all-users/${this.dbUsername}/user-posts/` + item.postUID] = item;
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
        this.getAllNotications();
    }
    ngAfterViewInit() {
        $(document).ready(function () {

            function readIMG(input) {
                if (input.files && input.files[0].type === 'video/mp4') {
                    const reader = new FileReader();

                    reader.onload = function (e) {
                        $('#previewVideo').css('display', 'block');
                        $('#previewVideo').attr('src', (<FileReader>e.target).result);
                    };

                    reader.readAsDataURL(input.files[0]);
                } else {
                    const imgReader = new FileReader();

                    imgReader.onload = function (e) {
                        $('#previewImage').css('display', 'block');
                        $('#previewImage').attr('src', (<FileReader>e.target).result);
                    };

                    imgReader.readAsDataURL(input.files[0]);
                }
            }

            $('#inputFiles').bind('change', function () {
                const value = $(this).val();
                if (value !== '') {
                    $('#btnUploadFiles').css('display', 'inline');
                    readIMG(this);
                } else {
                    $('#btnUploadFiles').css('display', 'none');
                }
            });


            $(window).resize(function() {
                if ($(window).width() < 500) {
                    $('body').css('font-size', '3vw' );
                } else if ($(window).width() >= 500 && $(window).width() < 600) {
                    $('body').css('font-size', '3vw');
                } else if ($(window).width() >= 600 && $(window).width() < 650) {
                    $('body').css('font-size', '2.4vw');
                } else if ($(window).width() >= 650 && $(window).width() < 748) {
                    $('body').css('font-size', '2vw');
                } else if ($(window).width() >= 748 && $(window).width() < 848) {
                    $('body').css('font-size', '1.8vw');
                } else if ($(window).width() >= 848 && $(window).width() < 1000) {
                    $('body').css('font-size', '1.6vw');
                } else if ($(window).width() >= 1000 && $(window).width() < 1200) {
                    $('body').css('font-size', '1.4vw');
                } else if ($(window).width() >= 1200) {
                    $('body').css('font-size', '1.2vw');
                }
                $('#winwidth').text($(window).width());
            });

            if ($(window).width() < 768) {
                $('#divUserPosts').addClass('user-post-margin');
            } else {
                $('#divUserPosts').removeClass('user-post-margin');
            }

            // cancelling new post
            $('#btnCancelPost').click(function(){
                $('#previewImgOrVideo').css('display', 'none');
                $('#previewImgOrVideo').attr('src', '');
            });
                // creating new post
            $('#btnNewlPost').click(function(){
                $('#previewImgOrVideo').css('display', 'inline');
            });
            $('#btnCreatePost').click(function(){
                $('#previewImgOrVideo').css('display', 'none');
                $('#previewImgOrVideo').attr('src', '');
            });
            $('#btnCancelUploadFiles').click(function(){
                $('#previewImgOrVideo').css('display', 'none');
            });
            // cancelling editing a post
            $('#btnCancelEditPost').click(function(){
            });

            // Cancelling editing a comment
            $('#btnCancelEditComment').click(function(){
            });

        });
    }

    // Notifications related methods ---------------------------- hELPER mETHODS ------------------------------------------

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
}
