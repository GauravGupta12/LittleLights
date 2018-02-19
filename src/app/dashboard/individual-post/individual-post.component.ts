import {Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import { ImageService } from '../../services/imageService';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import { AuthService } from '../../core/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserNotificationService } from '../services/user-notifications.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

@Component({
    selector: 'app-image-detail',
    templateUrl: './individual-post.component.html'
})
export class IndividualPostComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    public imageUrl = '';
    post: any;
    user: any;
    postAuthorUID: string;
    dbUsername: string;
    amazonEditPost = '';
    amazonComment = '';
    postComments: any;
    editPostModel: any;
    editCommentModel: any;
    postModelForEditingComment: any;
    myForm: FormGroup;
    myCommentForm: FormGroup;
    userPosts: any;
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
    isAddedToCollection = false;
    editPostContent = '';
    editPostTitle = '';
    myEditPostForm: FormGroup;
    isSympathisingStory = false;
    subscriptionNotifies: ISubscription;
    subscriptionPosts: ISubscription;

    constructor(private route: ActivatedRoute,
                private authService: AuthService,
                private afdb: AngularFireDatabase,
                private fb: FormBuilder,
                private notifyService: UserNotificationService,
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
                    }
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
    }
    ngOnDestroy() {
        this.subscriptionPosts.unsubscribe();
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
    }
// ========================================================================================
    showPost(postUID: any) {
        // postUID = '-L-tm2nma3DA9zqmTou4';
        this.userPosts = this.afdb.list('/all-posts/',
        ref => ref.orderByChild('postUID').equalTo(postUID)).valueChanges(['child_added', 'child_changed', 'child_removed']);
        this.subscriptionPosts = this.userPosts.subscribe((_items) => {
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
                                updates['/all-posts/' + item.postUID] = item;
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
        this.postComments = this.afdb.list('/all-comments/' + postUID).valueChanges();
        this.postComments.subscribe((_items) => {
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
                                updates['/all-comments/' + item.postUID + '/' + item.commentUID] = item;
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
    ngOnChanges() {

    }
    editPostFormCancel() {
        this.amazonEditPost = '';
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
    editPost(form: any) {
        if (this.editPostTitle) {
            if (this.editPostContent) {
                this.amazonEditPost = '';
                    if (this.editPostModel.authorUID === this.user.uid) {
                        const creationDateAndTime = this.getCreationDate();
                        this.editPostModel.title = form.title;
                        this.editPostModel.content = form.content;
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
            alert('Not permitted');
        }
    }
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
                    if (imageKey) {
                        firebase.storage().ref().child(`all-users/${this.dbUsername}/user-uploads/images/${imageName}`).delete();
                    }
                    if (videoKey) {
                        firebase.storage().ref().child(`all-users/${this.dbUsername}/user-uploads/videos/${videoName}`).delete();
                    }
                    alert('Story Deleted');
                })
                .catch((error) => {
                });
            }
        } else {
        }
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
                        // console.log(errorN);
                    });
                }
            })
            .catch( (errorNotification) => {

            });
        })
        .catch((error) => {
            // console.log(error);
        });
    }
    ngOnInit() {
        if (this.route.snapshot.params['id']) {
            this.showPost(this.route.snapshot.params['id']);
        }
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
        const day = d[1].startsWith('0') ? d[1].charAt(1) : d[1];
        const hours = today.toLocaleString().split(' ')[1].split(':')[0];
        const mins = today.toLocaleString().split(' ')[1].split(':')[1];
        const AM_PM = today.toLocaleString().split(' ')[2];
        const date =  d[0] + ' ' + day + ', ' + d[2] +  ' at ' + hours +
                     ':' + mins + ' ' + AM_PM;
        return date;
    }

}
