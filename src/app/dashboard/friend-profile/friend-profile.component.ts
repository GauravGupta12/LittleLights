import {Component, OnInit, Injectable, OnChanges, AfterViewInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
declare var $: any;

import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { database } from 'firebase/app';
import 'rxjs/add/operator/map';
import { UserNotificationService } from '../services/user-notifications.service';
import { ISubscription } from 'rxjs/Subscription';


@Component({
    selector: 'app-friend-profile',
    templateUrl: './friend-profile.component.html'
})
export class FriendProfileComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    user: any;
    dbUsername: string;
    friendPosts: Observable<any[]>;
    post_Comments: Observable<any[]>;

    // friend Info
    friendUID = '';
    friendName = '';
    friendEmail = '';
    friendPlace = '';
    friendHobbies = '';
    friendTagLine = '';
    friendShortDescription = '';
    friendPhotoURL = '';
    isConnection = 'notConnected';
    amazonComment = '';
    friendDBUsername = '';
    hasFriendRequestedToConnect = false; // true or false
    // isUserConnectedToFriend = 'notconnected';  // ignored, notconnected, connected
    isNotificationToConnect = false;  // true or false
    // for comments
    editCommentMsg = '';
    deleteCommentMsg = '';
    editCommentModel: any;
    postModelForEditingComment: any;
    myCommentForm: FormGroup;
    paramId: string;
    isFabMeStory = false;
    isEnlightenedStory = false;
    isInspiringStory = false;
    isAddedToCollection = false;
    isInterestingStory = false;
    isAppreciateStory = false;
    dbEmail = '';
    reachOutMsg = '';
    isFabMeComment = false;
    isInterestingComment = false;
    isAppreciateComment = false;
    isInspiringComment = false;
    isSympathisingStory = false;
    subscriptionNotifies: ISubscription;
    subscriptionPosts: ISubscription;

    constructor( private authService: AuthService, private fb: FormBuilder,
        private notifySvc: UserNotificationService,
        private notifyService: UserNotificationService,
        private router: Router, private route: ActivatedRoute,
        public gaService: GoogleAnalyticsService,
        public afAuth: AngularFireAuth, public afdb: AngularFireDatabase) {
            const a = 5;
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
            this.myCommentForm = fb.group({
                'commentText': ['', Validators.required]
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
    // -------------------------------------------------------------------------------------------------------
    cancelReachOut() {
        this.reachOutMsg = '';
    }
    reachOutToFriend() {
        if (this.reachOutMsg) {
            const creationDateAndTime = this.getCreationDate();
            const newReachOutMsgKey = firebase.database().ref().
            child(`/all-users/'${this.friendDBUsername}'/all-reachOutMessages`).push().key;
            const newMsgData = {
                reachOutMsgKey : newReachOutMsgKey,
                text : this.user.displayName + ' has sent a message to you',
                message : this.reachOutMsg,
                status : 'pending',
                time : firebase.database.ServerValue.TIMESTAMP,
                createdAt : creationDateAndTime,
                authorUID : this.user.uid,
                authorDBUsername : this.dbUsername,
                authorPic : this.user.photoURL,
                authorName : this.user.displayName,
                viewed : false,
                viewedOn : '',
                viewedOnServerTime : ''
            };
            const updates = {};
            updates[`/all-users/${this.friendDBUsername}/all-reachOutMessages/${newReachOutMsgKey}`] = newMsgData;
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
        firebase.database().ref(`/all-posts/${post.postUID}/addedtoMyColCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isAddedToCollection = false;
            } else {
                this.isAddedToCollection = true;
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
    addStoryToCollection(post: any) {
        this.isAddedToCollection = true;
        firebase.database().ref(`/all-posts/${post.postUID}/addedtoMyColCollection/${this.user.uid}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                this.isAddedToCollection = true;
                post.addedToColCount = post.addedToColCount ? 1 + post.addedToColCount : 1;
                const updates = {};
                updates[`all-posts/${post.postUID}`] = post;
                updates[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}`] = post;
                firebase.database().ref().update(updates)
                .then(() => {
                    const updateAddCol = {};
                    updateAddCol[`all-posts/${post.postUID}/addedtoMyColCollection/${this.user.uid}`] = {
                        userUID : this.user.uid, displayName : this.user.displayName
                    };
                    updateAddCol[`all-users/${post.authorDBUsername}/user-posts/${post.postUID}/addedtoMyColCollection/` +
                                                this.user.uid]  = { userUID : this.user.uid, displayName : this.user.displayName };
                    firebase.database().ref().update(updateAddCol)
                    .then(() => {
                        const a = 5;
                        firebase.database().ref(`all-users/${this.dbUsername}/user-profile/${this.user.uid}`).once('value')
                        .then( (snapshot1) => {
                            if (snapshot1.val()) {
                                const gender = snapshot1.val().gender === 'Male' ? 'his' : 'her';
                        this.notifyService.sendStoryAddToColNofcn(post.authorDBUsername, post.postUID, gender, this.user, this.dbUsername);
                                const updateAddMyCol = {};
                                updateAddMyCol[`all-users/${this.dbUsername}/my-collection/${post.postUID}`] = post;
                                firebase.database().ref().update(updateAddMyCol)
                                .then( () => {
                                    alert('Story added to your collection');
                                })
                                .catch();
                            }
                        });
                        })
                    .catch();
                }).catch((error) => {
                });
            } else {
                alert('You have already marked the story inspirational !');
            }
        });
        // addedToColCount
    }
    // Notifications related methods ---------------------------------------------------------------------

    unfriendFriend() {
        firebase.database().ref().child(`all-users/${this.dbUsername}/user-friends/${this.friendUID}`)
        .set(null)
        .then(() => {
            firebase.database().ref().child(`all-users/${this.friendDBUsername}/user-friends/${this.user.uid}`)
            .set(null)
            .then(() => {
                this.isConnection = 'notConnected';
                this.isNotificationToConnect = false;
                // alert(`Connected to ${this.friendDBUsername}`);
                // this.notifySvc.sendRequestConfirmNotifcation(this.friendDBUsername, this.friendUID, this.user, this.dbUsername);
            }).catch((errorFriendEntry) => {
                alert('Some error occured, please try again..');
            });
        }).catch((error1) => {
            alert('Some error occured, please try again..');
        });
    }
    revokeFriendRequest() {
        firebase.database().ref().child(`all-users/${this.dbUsername}/pending-requests/friend-request/${this.friendUID}`).once('value',
            (snapshot) => {
                if (snapshot.val()) {
                    const notificationKey = snapshot.val().notificationKey;
                    firebase.database().ref().child('/all-users/' + this.friendDBUsername + '/all-notifications/' + notificationKey)
                    .set(null)
                    .then(() => {
                        firebase.database().ref().child(`all-users/${this.dbUsername}/pending-requests/friend-request/${this.friendUID}`)
                        .set(null)
                        .then(() => {
                            this.isConnection = 'notConnected';
                            // alert('Request revoked successfully');
                        });
                    });
                }
            }).catch((error) => {
                alert('Some network error occured, please try again');
            });
    }
    acceptFriendRequest() {
        const friendSince = this.getCreationDate();
        const userEntryData = {
            friendUID : this.friendUID,
            friendName : this.friendName,
            friendDBUsername : this.friendDBUsername,
            friendEmail : this.friendEmail,
            friendSince : friendSince,
            profilePic : this.friendPhotoURL,
            time : firebase.database.ServerValue.TIMESTAMP,
            status : 'friend',    // friend, blocked
        };
        const friendEntryData = {
            friendUID : this.user.uid,
            friendName : this.user.displayName,
            friendDBUsername : this.dbUsername,
            friendEmail : this.user.email,
            friendSince : friendSince,
            profilePic : this.user.photoURL,
            time : firebase.database.ServerValue.TIMESTAMP,
            status : 'friend',    // friend, blocked
        };
        firebase.database().ref().child(`all-users/${this.dbUsername}/user-friends/${this.friendUID}`)
        .set(userEntryData)
        .then(() => {
            firebase.database().ref().child(`all-users/${this.friendDBUsername}/user-friends/${this.user.uid}`)
            .set(friendEntryData)
            .then(() => {
                this.isConnection = 'connected';
                // alert(`Connected to ${this.friendDBUsername}`);
                this.notifySvc.sendRequestConfirmNotifcation(this.friendDBUsername, this.friendUID, this.user, this.dbUsername);
            }).catch((errorFriendEntry) => {
                alert('Some error occured, please try again..');
            });
        }).catch((error1) => {
            alert('Some error occured, please try again..');
        });
    }
    sendFriendRequestNotification() {
        const data = {};
        this.notifySvc.sendFrndRqstNotification(this.friendDBUsername, this.friendUID, this.user, this.dbUsername)
        .then(() => {
            this.isConnection = 'pendingRequest';
            // alert('Request sent');
        }).catch( (error) => {
            alert('Some error occured, please try again..');
        });
    }
    checkIsConnected() {
        firebase.database().ref().child(`all-users/${this.dbUsername}/user-friends/${this.friendUID}`).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                firebase.database().ref().child(`all-users/${this.dbUsername}/pending-requests/friend-request/${this.friendUID}`)
                .once('value')
                .then( (snapshot1) => {
                    if (snapshot1.val()) {
                        this.isConnection = 'pendingRequest';
                    } else {
                        firebase.database().ref()
                        .child(`all-users/${this.friendDBUsername}/pending-requests/friend-request/${this.user.uid}`)
                        .once('value')
                        .then( (snapshot2) => {
                            if (snapshot2.val()) {
                                this.isConnection = 'pendingRequest';
                                this.hasFriendRequestedToConnect = true;
                            } else {
                                this.isConnection = 'notConnected';
                                this.hasFriendRequestedToConnect = false;
                            }
                        }).catch((error1) => {
                            alert('Some error occured, please try again..');
                        });
                    }
                }).catch((error1) => {
                    alert('Some error occured, please try again..');
                });
            } else {
                this.isConnection = 'connected';
            }
        }).catch((error) => {
            alert('Some error occured, please try again..');
        });
    }
    getFriendInfo() {
        this.checkIsConnected();
        firebase.database().ref(`all-users/userUIDs/${this.friendUID}`).once('value').then( (snapshotDBName) => {
            if (snapshotDBName.val()) {
                this.friendDBUsername = snapshotDBName.val().dbUsername;
                this.friendPhotoURL = snapshotDBName.val().photoURL;
                firebase.database().ref(`all-users/${this.friendDBUsername}/user-profile/${this.friendUID}`).once('value')
                .then( (snapshot) => {
                    if (snapshot.val()) {
                        this.friendName =  snapshot.val().displayName;
                        // this.friendPhotoURL =  snapshot.val().photoURL;
                        this.friendEmail =  snapshot.val().email;
                        this.friendPlace =  snapshot.val().place || '';
                        this.friendTagLine =  snapshot.val().tagLine || '';
                        this.friendHobbies =  snapshot.val().hobbies || '';
                        this.friendShortDescription =  snapshot.val().shortDescription || '';
                    }
                  })
                  .catch( (error) => {
                        // console.log(error);
                  });

                this.friendPosts = this.afdb.list(`/all-users/${this.friendDBUsername}/user-posts/`,
                    ref => ref.orderByChild('postNumber')).valueChanges(['child_added', 'child_changed', 'child_removed']);
                this.subscriptionPosts = this.friendPosts.subscribe((_items) => {
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
                                        updates['/all-users/' + this.friendDBUsername + '/user-posts/' + item.postUID] = item;
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
        });
    }
    public getCommentsforPost(postUID: any) {
        this.post_Comments = this.afdb.list('/all-comments/' + postUID).valueChanges();
        this.post_Comments.subscribe((_items) => {
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
    ngOnInit() {
        this.paramId = this.route.snapshot.params['id'];
        if (this.paramId.includes('true')) {
            this.friendUID = this.paramId.split('true')[0];
            this.isNotificationToConnect = true;
        } else if (this.paramId.includes('false')) {
            this.friendUID = this.paramId.split('false')[0];
            this.isNotificationToConnect = false;
        } else {
            this.friendUID = this.route.snapshot.params['id'];
            this.isNotificationToConnect = false;
        }

        if (this.friendUID === this.user.uid) {
            this.router.navigate([`/dashboard/my-profile`]);
        } else {
            this.getFriendInfo();
        }
    }
    ngOnChanges() {
        // not sure about code here..
        this.getFriendInfo();
    }
    postNewComment(commentVal: any, post: any) {
        // if (e.keyCode === 13) {
            this.saveComment(commentVal, post);
        // }
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
            // this.submitGAEvent();
            const updateCommentCount = {};
            updateCommentCount['/all-posts/' + post.postUID + '/commentsCount' ] = post.commentsCount + 1;
            updateCommentCount['/all-users/' + post.authorDBUsername + '/user-posts/' + post.postUID + '/commentsCount']
                                                                                         = 1 + post.commentsCount ;
            firebase.database().ref().update(updateCommentCount);
        })
        .catch((error) => {
            // console.log(error);
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
                    this.editCommentMsg = 'Comment Edited';
                    // alert(this.editCommentMsg);
                    setTimeout( () => {
                        this.editCommentMsg = '';
                    }, 1500);
                    this.editCommentModel = null;
                    this.postModelForEditingComment = null;
                })
                .catch((error) => {
                    // console.log(error);
                    this.editCommentMsg = 'There is some error. Please try again !';
                    alert(this.editCommentMsg);
                    setTimeout( () => {
                        this.editCommentMsg = '';
                    }, 1500);
                });
            } else {
                this.editCommentMsg = 'Not permitted';
                alert(this.editCommentMsg);
                setTimeout( () => {
                    this.editCommentMsg = '';
                }, 1500);
            }
        }
    }
    deleteComment(comment: any, post: any) {
        if (comment.authorUID === this.user.uid) {

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
                this.deleteCommentMsg = 'Comment deleted';
                // alert(this.deleteCommentMsg);
                setTimeout( () => {
                    this.deleteCommentMsg = '';
                }, 1500);
            })
            .catch((error) => {
                // console.log(error);
                this.deleteCommentMsg = 'There is some error. Please try again !';
                alert(this.deleteCommentMsg);
                setTimeout( () => {
                    this.deleteCommentMsg = '';
                }, 1500);
            });
        } else {
            this.deleteCommentMsg = 'Not permitted';
            alert(this.deleteCommentMsg);
            setTimeout( () => {
                this.deleteCommentMsg = '';
            }, 1500);
        }
    }
    ngOnDestroy() {
        if (this.subscriptionPosts) {
            this.subscriptionPosts.unsubscribe();
        }
        // alert('alert from ngOnDestroy.');
    }
    ngAfterViewInit() {
        $(document).ready(function () {
            if ($('#divPostFooter').width() < 301) {
                $('#spanFeaturesMargin').css('margin-left', '20px' );
            } else if ($('#divPostFooter').width() >= 301 && $('#divPostFooter').width() < 365) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.2 );
            } else if ($('#divPostFooter').width() >= 365 && $('#divPostFooter').width() < 388) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.3 );
            } else if ($('#divPostFooter').width() >= 388 && $('#divPostFooter').width() < 410) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.33 );
            } else if ($('#divPostFooter').width() >= 410 && $('#divPostFooter').width() < 450) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.34 );
            } else if ($('#divPostFooter').width() >= 450 && $('#divPostFooter').width() < 473) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.38 );
            } else if ($('#divPostFooter').width() >= 473 && $('#divPostFooter').width() < 500) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.45 );
            } else if ($('#divPostFooter').width() >= 500 && $('#divPostFooter').width() < 519) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.47 );
            } else if ($('#divPostFooter').width() >= 519 && $('#divPostFooter').width() < 523) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.46 );
            } else if ($('#divPostFooter').width() >= 523 && $('#divPostFooter').width() < 550) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.5 );
            } else if ($('#divPostFooter').width() >= 550 && $('#divPostFooter').width() < 600) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.52 );
            } else if ($('#divPostFooter').width() >= 600 ) {
                $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.55 );
            }

            $(window).resize(function() {
                if ($('#divPostFooter').width() < 301) {
                    $('#spanFeaturesMargin').css('margin-left', '20px' );
                } else if ($('#divPostFooter').width() >= 301 && $('#divPostFooter').width() < 365) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.2 );
                    if ($(window).width() >= 773 && $(window).width() < 980) {
                        $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.15 );
                    }
                } else if ($('#divPostFooter').width() >= 365 && $('#divPostFooter').width() < 388) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.3 );
                } else if ($('#divPostFooter').width() >= 388 && $('#divPostFooter').width() < 410) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.33 );
                } else if ($('#divPostFooter').width() >= 410 && $('#divPostFooter').width() < 450) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.34 );
                } else if ($('#divPostFooter').width() >= 450 && $('#divPostFooter').width() < 473) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.38 );
                } else if ($('#divPostFooter').width() >= 473 && $('#divPostFooter').width() < 500) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.45 );
                } else if ($('#divPostFooter').width() >= 500 && $('#divPostFooter').width() < 519) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.47 );
                } else if ($('#divPostFooter').width() >= 519 && $('#divPostFooter').width() < 523) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.46 );
                } else if ($('#divPostFooter').width() >= 523 && $('#divPostFooter').width() < 550) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.5 );
                } else if ($('#divPostFooter').width() >= 550 && $('#divPostFooter').width() < 600) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.52 );
                } else if ($('#divPostFooter').width() >= 600 ) {
                    $('#spanFeaturesMargin').css('margin-left', $('#divPostFooter').width() * 0.55 );
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
}
