import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { User } from '../models/user.model';

@Injectable()
export class AuthService {

    googleUser: string;
    user: firebase.User;
    firebaseUser: any;
    currentUserid: any;
    useremail: any;
    registerUserName: string;
    currentlyLoggedUser = '';
    authDbUsername: string;
    userModel: User;
    public userGender: string;
    authState: Observable<firebase.User>;

    constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase,
                private router: Router) {

        this.authState = afAuth.authState;
    }

    getCurrentUser() {
        const user = firebase.auth().currentUser;
        if (user) {
            return user;
        } else {
            return null;
        }
    }
    get currentUserId(): string {
        return this.user !== null ? this.user.uid : '';
    }
    isLoggedIn(): boolean {
        const user = firebase.auth().currentUser;
        if (user) {
            return true;
        } else {
            return false;
        }
     }
     logout() {
         this.afAuth.auth.signOut()
         .then( () => {
             // this.user = firebase.auth().currentUser;
             this.router.navigate(['login']);
         });
     }
    signUp(userName: string, password: string, email: string, gender: string) {
        this.registerUserName = userName;
        return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
            this.authState = user;
            this.setUserData(userName, '/assets/images/evening.jpg', user.uid, user.email, password, gender);

            this.updateUserProfile(userName, '/assets/images/evening.jpg')
            .catch(error => console.log(error));
        });

    }

    login(email: string, password: string): Promise<any> {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then( (user) => {
            // this.setLoggedinUser(result);
            this.authState = user;
        });
    }

    updateUserProfile(name: string, photoURL: string) {
        return firebase.auth().currentUser.updateProfile({
                    displayName : name,
                    photoURL : photoURL
                }).then( (user) => {
                    const a = 5;
                }).catch( (error) => {
                    // console.log(error);
                });
    }
    setUserData(displayName: string, photoURL: any, uid: string, email: string, password: string, gender: string) {
        this.userGender = gender;
        const creationDateAndTime = this.getCreationDate();
        let dbUsername = '';
        if (email === 'twtr@#$123') {
           dbUsername = 'twtr' +  uid;
        } else {
            dbUsername = email.replace('.', '');
            do {
                dbUsername = dbUsername.replace('.', '');
            }
            while (dbUsername.includes('.'));
            dbUsername = dbUsername + uid.substr(0, 12);
        }

        firebase.database().ref('/all-users/' + dbUsername + '/user-profile/' + uid).once('value')
        .then( (snapshot) => {
            if (!snapshot.val()) {
                // user doesn't exist
                // const userprofileRef = firebase.database().ref().child(`all-users/${userEmail}/user-profile/${uid}`).push();
                const newUser_ProfileData = {
                    uid: uid,
                    displayName: displayName,
                    email: email === 'twtr@#$123' ? 'email' : email ,
                    password: password,
                    gender: gender,
                    time: firebase.database.ServerValue.TIMESTAMP,
                    createdAt: creationDateAndTime,
                };
                // Write the new user's data
                const updates = {};
                updates[`all-users/${dbUsername}/user-profile/${uid}`] = newUser_ProfileData;
                updates[`all-users/userUIDs/${uid}`] = {dbUsername : dbUsername, photoURL: photoURL || '/assets/images/evening.jpg',
                    displayName : displayName };
                firebase.database().ref().update(updates)
                .then(() => {
                    firebase.auth().currentUser.sendEmailVerification()
                    .then(() => {
                        alert('An email is sent to verify your email address. Please check your inbox to verify.');
                    }).catch((error) => {
                        // some code.
                    });
                });
            } else {
                const a = 5;
            }
          })
          .catch( (error) => {
                alert('Some internal error, plaese try again');
          });
    }

    loginGoogle(): Promise<any> {
        return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then( (result) => {
            this.registerUserName = result.user.displayName;
            this.authDbUsername = result.user.email.replace('.', '');
            this.setUserData(result.user.displayName, result.user.photoURL, result.user.uid, result.user.email, 'nopassword', 'nogender');
        });
    }
    loginFacebook(): Promise<any> {
        return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then( (result) => {
            this.registerUserName = result.user.displayName;
            this.setUserData(result.user.displayName, result.user.photoURL, result.user.uid, result.user.email, 'nopassword', 'nogender');
        });
    }
    loginGit(): Promise<any> {
        return firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider())
        .then((result) => {
            this.registerUserName = result.user.displayName;
            this.setUserData(result.user.displayName, result.user.photoURL, result.user.uid, result.user.email, 'nopassword', 'nogender');
        });
    }
    loginGithub(): Promise<any> {
        return this.afAuth.auth.signInWithPopup(new firebase.auth.GithubAuthProvider())
        .then( (result) => {
            this.registerUserName = result.user.displayName;
            this.setUserData(result.user.displayName, result.user.photoURL, result.user.uid, result.user.email, 'nopassword', 'nogender');
        });
    }
    loginTwitter(): Promise<any> {
        return this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider())
        .then( (result) => {
            this.registerUserName = result.user.displayName;
            this.setUserData(result.user.displayName, result.user.photoURL, result.user.uid, 'twtr@#$123', 'nopassword', 'nogender');
        });
    }
    reauthenticatUser() {}

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
export const Auth_Providers: Array<any> = [
    { provide: AuthService, useClass: AuthService }
];
