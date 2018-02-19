import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
declare var ga: Function;
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import {  AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { AuthService } from '../core/auth.service';

function skuValidator(control: FormControl): { [s: string]: boolean } {
    if (!control.value.match(/^123/)) {
      return {invalidSku: true};
    }
}
function matchPasswords(control: FormControl): { [s: string]: boolean } {
    const formGrp = control.parent;
    if (formGrp) {
        const password = formGrp.controls['password'];
        if (control && password) {
            if (control.value !== password.value) {
                return {passwordMisMatch : true};
            } else {
                return {passwordMisMatch : false};
            }
        }
    }
    return null;
}
function validateEmail(control: FormControl): { [s: string]: boolean } {
    if (!control.value.match(/^123/)) {
      return {invalidSku: true};
    }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  myForm: FormGroup;
  age: number;
  registerErrorCode: string;
  registerErrorMessage: string;
  EmailAlreadyExists = false;
  pwdStrength = '';

  constructor(fb: FormBuilder, private authServive: AuthService, private router: Router,
              private afdb: AngularFireDatabase, private gaService: GoogleAnalyticsService) {
      this.myForm = fb.group({
          'username': ['', Validators.required],
          'email': ['',  Validators.compose([Validators.required ])],
          'password': ['', Validators.compose([Validators.required, Validators.minLength(8),
                        Validators.maxLength(12)])],
          'confirmPassword' : ['', Validators.compose([Validators.required ])],
          'gender' : ['', Validators.required]
      });
      this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
              ga('set', 'page', event.urlAfterRedirects);
              ga('send', 'pageview');
          }
      });
    }
    checkEmailExist(email: any) {
        const pattern1 = new RegExp('^[a-zA-Z]+[a-zA-Z0-9_\.]+@[a-z]+\.[a-z]{2,5}(\.[a-z]{2,4})?$');
        // const pattern = new RegExp('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$');
        // pattern.test(emailCheck);
        const emailCheck = email.includes('@') ? (email.split('@')[1].includes('.') ? email : '') : '' ;
        if (pattern1.test(emailCheck)) {
            firebase.auth().fetchProvidersForEmail(emailCheck)
            .then((providers) => {
                if (providers[0]) {
                    this.EmailAlreadyExists = true;
                    this.myForm.controls['email'].setErrors({'emailExist' : true});
                } else {
                    this.EmailAlreadyExists = false;
                    if (this.myForm.controls['email'].getError('emailExist')) {
                        this.myForm.controls['email'].setErrors(null);
                    }
                }
            });
        } else {
            this.EmailAlreadyExists = false;
            if (this.myForm.controls['email'].getError('emailExist')) {
                this.myForm.controls['email'].setErrors(null);
            }
        }
    }
    passwordStrengthValidate(password: any) {
        const hasSpecialChar = new RegExp('^(?=.*[!@#\$%\^&\*])');
        const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$\*])(?=.{8,})');
        const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})');
        if (password.length >= 8 && password.length <= 12) {
            if (hasSpecialChar.test(password)) {
                if (strongRegex.test(password)) {
                    this.pwdStrength = 'strong';
                } else if (mediumRegex.test(password)) {
                    this.pwdStrength = 'medium';
                } else {
                    this.pwdStrength = 'weak';
                }
            } else {
                this.pwdStrength = 'weak';
            }
        } else {
            this.pwdStrength = '';
        }
    }
    onSubmit(form: any) {
        const a = 5;
        this.authServive.signUp(form.username, form.password, form.email, form.gender)
            .then( (result) => this.registerSuccessful(result))
            .catch( (error) => this.registerFailed(error));
    }
    registerSuccessful(result: any) {
        this.submitGAEvent();
        this.router.navigate(['/dashboard/my-profile']);
    }
    registerFailed(error: any) {
       this.registerErrorCode = error.code;
       this.registerErrorMessage = error.message;
       setTimeout(function () {
           this.registerErrorMessage = '';
       }.bind(this), 30000);
    }

    ngOnInit() {
    }
    submitGAEvent() {
        this.gaService.emitEvent('RegisterCategory', 'RegisterEvent', 'RegisterLabel', 10);
    }

}
