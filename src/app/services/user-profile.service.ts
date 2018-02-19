import {Component, OnInit, Injectable} from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { Upload } from '../models/upload.model';
import * as firebase from 'firebase';
import { GalleryImage } from '../models/galleryImage.model';
import { AuthService } from '../core/auth.service';
import { User } from '../models/user.model';
import { AngularFireList } from 'angularfire2/database/interfaces';


@Injectable()
export class UserProfileService {
    user: any;
    basePath: string;
    dbUsername: string;
    userModel: User;
    uploads: AngularFireList<GalleryImage[]>;

    constructor(private db: AngularFireDatabase, private authService: AuthService) {
        // this.dbUsername = this.authService.authDbUsername;
        this.user = this.authService.getCurrentUser();
        // this.user.providerData.forEach( (p) => {
        //     if ( p.providerId === 'twitter.com') {
        //         this.dbUsername = 'twtr' + this.user.uid;
        //     } else {
        //         this.dbUsername = this.user.email.replace('.', '') + this.user.uid.substr(0, 12);
        //     }
        // });
    }

    updateUserDetails(profilePicKey: string, displayName: any, uid: any, email: any, creationDateAndTime: any,
            place: any, hobbies: any, tagLine: any, gender: any, shortDescription: any, dbUsername: any) {
        if (true) {
            const updationDateAndTime = this.getCreationDate();
            const updateProfileData = {
                uid: uid,
                displayName: displayName,
                email: email,
                createdAt: creationDateAndTime,
                isUpdated: true,
                timeofLastUpdate: updationDateAndTime,
                timeofLastUpdateAtServer: firebase.database.ServerValue.TIMESTAMP,
                hobbies: hobbies,
                place: place,
                tagLine: tagLine,
                gender: gender,
                shortDescription: shortDescription,
                // photoURL: photoURL,
                dbUsername: dbUsername,
                // profilePicKey: profilePicKey
            };
            const updates = {};
            updates['/all-users/' + dbUsername + '/user-profile/' + uid] = updateProfileData;
            return firebase.database().ref().update(updates)
            .then( (result) => {
               // console.log(result);
            })
            .catch( (error) => {
              //   console.log(error);
            });
        }
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







