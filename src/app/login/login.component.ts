import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
declare var ga: Function;
declare var $: any;


import { Observable } from 'rxjs/Observable';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireList } from 'angularfire2/database/interfaces';
import { Promise } from 'q';

export interface IMessage {
  avatar: string;
  from: string;
  content: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
    @ViewChild('btnPassword') buttonPassword: ElementRef;
    @ViewChild('btnPasswordNew') btnPasswordNew: ElementRef;
    @ViewChild('inpEmail') inpEmail: ElementRef;
    loginErrorMessage: string;
    myForm: FormGroup;
    forgotPasswordForm: FormGroup;
    formNewPassword: FormGroup;
    formExistingPassword: FormGroup;
    userId: any;
    user: Observable<firebase.User>;
    items: AngularFireList<any>;
    EmailExists = true;
    EmailFPExists = false;
    existingPassword = '';
    newPasswordForEA = '';
    tryingLoginUserEmail = '';

  constructor(fb: FormBuilder, private renderer: Renderer2, public authService: AuthService, private router: Router,
    private db: AngularFireDatabase, private gaService: GoogleAnalyticsService) {
        this.myForm = fb.group({
            'email': ['', Validators.required],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        });
        this.formNewPassword = fb.group({
            'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        });
        this.formExistingPassword = fb.group({
            'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
        });
        this.forgotPasswordForm = fb.group({
            'email': ['', Validators.required],
        });
        this.loginErrorMessage = '';
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                ga('set', 'page', event.urlAfterRedirects);
                ga('send', 'pageview');
            }
        });

    }
    // ----------------------------------------------------------------------------------------------
    cancelForgotPasswordEmail() {
        this.forgotPasswordForm.controls['email'].reset();
    }
    SendForgotPasswordEmail(emailFP: any) {
        if (emailFP) {
            this.forgotPassword(emailFP);
        }
    }
    forgotPassword(email: string) {
        const auth = firebase.auth();

        auth.sendPasswordResetEmail(email).then( (result) => {
          // Email sent.
            alert('An email is sent to email \"' + email + '\". Please use the link in the email to reset the password' +
            ' and sign in again.');
            this.forgotPasswordForm.controls['email'].reset();
        }).catch( (error) => {
          // An error happened.
            const a = error;
        });
    }
    checkEmailExistForgotPassword(email: any) {
        const pattern1 = new RegExp('^[a-zA-Z]+[a-zA-Z0-9_\.]+@[a-z]+\.[a-z]{2,5}(\.[a-z]{2,4})?$');
        const emailCheck = email.includes('@') ? (email.split('@')[1].includes('.') ? email : '') : '' ;
        if (pattern1.test(emailCheck)) {
            firebase.auth().fetchProvidersForEmail(emailCheck)
            .then((providers) => {
                if (providers[0]) {
                    this.EmailFPExists = true;
                    if (this.forgotPasswordForm.controls['email'].getError('emailExist')) {
                        this.forgotPasswordForm.controls['email'].setErrors(null);
                    }
                } else {
                    if (true) {
                        this.EmailFPExists = false;
                    }
                }
            });
        } else {
            this.EmailFPExists = true;
            if (this.forgotPasswordForm.controls['email'].getError('emailExist')) {
                this.forgotPasswordForm.controls['email'].setErrors(null);
            }
        }
    }
    checkEmailExist(email: any) {
        const pattern1 = new RegExp('^[a-zA-Z]+[a-zA-Z0-9_\.]+@[a-z]+\.[a-z]{2,5}(\.[a-z]{2,4})?$');
        const pattern = new RegExp('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$');
        // pattern.test(emailCheck);
        const emailCheck = email.includes('@') ? (email.split('@')[1].includes('.') ? email : '') : '' ;
        if (pattern1.test(emailCheck)) {
            firebase.auth().fetchProvidersForEmail(emailCheck)
            .then((providers) => {
                if (providers[0]) {
                    this.EmailExists = true;
                    if (this.myForm.controls['email'].getError('emailExist')) {
                        this.myForm.controls['email'].setErrors(null);
                    }
                } else {
                    if (true) {
                        this.EmailExists = false;
                        // this.myForm.controls['email'].setErrors({'emailExist' : true});
                    }
                }
            });
        } else {
            this.EmailExists = true;
            if (this.myForm.controls['email'].getError('emailExist')) {
                this.myForm.controls['email'].setErrors(null);
            }
        }
    }
    afterSignIn(): void {
        this.submitEvent();
        this.router.navigate(['/dashboard']);
    }
    login(form: any) {
        this.loginErrorMessage = '';
        this.authService.login(form.email, form.password)
            .then( () => {
                // firebase.auth().currentUser.unlink('facebook.com')
                // .then((user) => {
                //     const a = user;
                // }).catch((error) => {
                //     alert(error.message);
                // });
                this.afterSignIn();
            })
            .catch((error) => {
                if (error.code === 'auth/wrong-password') {
                    let providers = [];
                    firebase.auth().fetchProvidersForEmail(form.email)
                    .then((p) => {
                        providers = p;
                        if (providers.length > 0 && providers.indexOf('password') === -1 ) {
                            const providerID = providers[0];
            alert('This email is already linked to an existing ' + providerID.split('.')[0] + ' account. Please login to continue..');
                            const provider = this.getProviderId(providerID);
                            firebase.auth().signInWithPopup(provider)
                            .then( (result) => {
                                    if (result.credential) {
                                        const token = result.credential.token;
                                    }
                                    this.tryingLoginUserEmail = form.email;
            const wantTo = confirm('Do you want to login with same email in normal way. This would allow you to not to login using '
            + providerID.split('.')[0] + ' everytime. Please select OK to continue or Cancel to ignore it this time.');
                                    if (wantTo) {
                                        this.promptUserForNewPassword();
                                    }
                            })
                            .catch( (error_popup) => {
                                const popUP_error = error_popup.message;
                                if (popUP_error === 'The popup has been closed by the user before finalizing the operation.') {
                                    alert('Please provide the details to login successfully');
                                }
                            });
                        } else {
                            this.loginErrorMessage = 'Incorrect credentials.';
                            setTimeout(function () {
                                this.loginErrorMessage = '';
                            }.bind(this), 2500);
                        }
                    });
                } else {
                    this.loginErrorMessage = 'Incorrect credentials.';
                    setTimeout(function () {
                        this.loginErrorMessage = '';
                    }.bind(this), 2500);
                }
            });
    }
    // ---------------------------------------------------------------------
    cancelNewPassword() {
        this.formNewPassword.controls['password'].reset();
    }
    ValidateNewPassword(newP: string) {
        if (newP) {
            this.newPasswordForEA = newP;
            if (this.newPasswordForEA) {
                const credential = firebase.auth.EmailAuthProvider.credential(this.tryingLoginUserEmail, this.newPasswordForEA);
                    firebase.auth().currentUser.linkWithCredential(credential)
                        .then( (user) => {
                            const a = user;
                    alert('Congrats, now you can use either method to sign in.');
                            this.afterSignIn();
                        })
                        .catch( (errorLinking) => {
                            const a = errorLinking;
                        });
            } else {
                alert('Password does not match');
            }
        }
    }
    promptUserForNewPassword() {
        this.btnPasswordNew.nativeElement.click();
    }
    cancelExistingPassword() {
        this.formExistingPassword.controls['password'].reset();
    }
    ValidateExistingPassword(newP: string) {
        if (newP) {
            this.existingPassword = newP;
        }
    }
    promptUserForPassword(provider: string) {
        return 'gaurav';
    }
    // ---------------------------------------------------------------------
    loginGoogle() {
        this.authService.loginGoogle()
                .then( (result) => {
                    this.afterSignIn();
                })
                .catch ( (error) => {
                    if (error.code === 'auth/account-exists-with-different-credential') {
                        const pendingCred = error.credential;
                        const email = error.email;
                        firebase.auth().fetchProvidersForEmail(email).then( (providers) => {
                            if (providers[0] === 'password') {
                                alert(`There is already an existing account with this email, please use normal way to sign-in`);
                            } else {
                        alert(`There is an existing account with different provider for this email , please use that for sign-in`);
                            }
                        });
                    } else {
                        alert('Some problem, please try later..');
                    }
                });
    }
    loginFacebook() {
        this.authService.loginFacebook()
        .then( (result) => {
            this.afterSignIn();
        })
        .catch ( (error) => {
            if (error.code === 'auth/account-exists-with-different-credential') {
                // alert('You have already signed up with a different auth provider for that email.');
                const pendingCred = error.credential;
                // The provider account's email address.
                const email = error.email;
                // Get registered providers for this email.
                firebase.auth().fetchProvidersForEmail(email).then( (providers) => {
                    if (providers[0] === 'password') {
                        alert(`There is already an existing account with this email, please use normal way to sign-in`);
                    } else {
                alert(`There is an existing account with different provider for this email , please use that for sign-in`);
                    }
                    // if (providers[0] === 'password') {
                    //     const password = this.promptUserForPassword(providers[0]); // TODO: implement promptUserForPassword.
                    //     firebase.auth().signInWithEmailAndPassword(email, password).then( (user)  => {
                    //         return user.linkWithCredential(pendingCred);
                    //     }).then( ( user) => {
                    //         const a  = user;
                    //         this.afterSignIn();
                    //     });
                    //     return;
                    // }
                    // alert(`There is already an existing account with this email using ${providers[0]}, please use it login`);
                    // const provider = this.getProviderId(providers[0]);
                    // firebase.auth().signInWithPopup(provider).then( (result) => {
                    //     const resultingUser = result.user;
                    //     firebase.auth().currentUser.linkWithCredential(pendingCred).then( (user) => {
                    //         const a  = user;
                    //         this.afterSignIn();
                    //     });
                    // });
                });
            } else {
                alert('Some problem, please try later..');
            }
        });
    }
    loginTwitter() {
        this.authService.loginTwitter()
        .then( (result) => {
            this.afterSignIn();
        })
        .catch ( (error) => {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const pendingCred = error.credential;
                const email = error.email;
                firebase.auth().fetchProvidersForEmail(email).then( (providers) => {
                    if (providers[0] === 'password') {
                        alert(`There is already an existing account with this email, please use normal way to sign-in`);
                    } else {
                alert(`There is an existing account with different provider for this email , please use that for sign-in`);
                    }
                });
            } else {
                alert('Some problem, please try later..');
            }
        });
    }
    loginGithub() {
        this.authService.loginGit()
        .then( (result) => {
            this.afterSignIn();
        })
        .catch ( (error) => {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const pendingCred = error.credential;
                const email = error.email;
                firebase.auth().fetchProvidersForEmail(email).then( (providers) => {
                    if (providers[0] === 'password') {
                        alert(`There is already an existing account with this email, please use normal way to sign-in`);
                    } else {
                alert(`There is an existing account with different provider for this email , please use that for sign-in`);
                    }
                });
            } else {
                alert('Some problem, please try later..');
            }
        });
    }
    getProviderId(providerID: string) {
        switch (providerID) {
            case 'google.com':
                return new firebase.auth.GoogleAuthProvider();
            case 'facebook.com':
                return new firebase.auth.FacebookAuthProvider();
            case 'github.com':
                return new firebase.auth.GithubAuthProvider();
            case 'twitter.com':
                return new firebase.auth.TwitterAuthProvider();
            case 'password':
                    return new firebase.auth.EmailAuthProvider();
            default:
                break;
        }
    }
    logout() {
        this.authService.logout();
    }
    ngAfterViewInit() {
        this.inpEmail.nativeElement.focus();
        $(document).ready(function () {
        //     const popup = window.open('#', 'directories=no,height=100,width=100');
        //     setTimeout( function() {
        //        if (!popup || popup.outerHeight === 0) {
        //            // First Checking Condition Works For IE & Firefox
        //            // Second Checking Condition Works For Chrome
        //            alert('Popup Blocker is enabled! Please add this site to your exception list.');
        //        } else {
        //            // Popup Blocker Is Disabled
        //            // window.open('', '_self');
        //           // window.close();
        //        }
        //    }, 25);
        });
      }

    submitEvent() {
        this.gaService.emitEvent('LoginCategory', 'LoginEvent', 'LoginLabel', 10);
        }
    ngOnInit() {
        this.myForm.controls['email'].reset();
        this.myForm.controls['password'].reset();
    }
}

