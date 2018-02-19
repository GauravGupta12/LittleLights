import {Component, OnInit, Injectable} from '@angular/core';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { GalleryImage } from '../models/galleryImage.model';
import {} from 'angularfire2';
import 'firebase/storage';
import * as firebase from 'firebase';
import { AuthService } from '../core/auth.service';

@Injectable()
export class ImageService implements OnInit {
    user: any;
    uid: string;
    dbUsername: string;

    constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase,
                private  authService: AuthService) {
        // this.afAuth.authState.subscribe(auth => {
        //     if (auth !== undefined && auth !== null) {
        //         this.uid = auth.uid;
        //     }
        // });
        // this.dbUsername = this.authService.authDbUsername;
        this.user = this.authService.getCurrentUser();
        // this.user.providerData.forEach( (p) => {
        //     if ( p.providerId === 'twitter.com') {
        //         this.dbUsername = 'twtr' + this.user.displayName.replace(' ', '');
        //     } else {
        //         this.dbUsername = this.user.email.replace('.', '');
        //     }
        // });
    }
    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        // this.user.providerData.forEach( (p) => {
        //     if ( p.providerId === 'twitter.com') {
        //         this.dbUsername = 'twtr' + this.user.uid;
        //     } else {
        //         this.dbUsername = this.user.email.replace('.', '') + this.user.uid.substr(0, 12);
        //     }
        // });
    }
    getImage(key: string, dbUsername: any) {
         return firebase.database().ref('all-users/' + dbUsername + '/user-uploads/' + 'images/' + key).once('value')
                .then((snap) => snap.val());
    }
    getImages(dbUsername: any): any {
        return this.db.list('all-users/' + dbUsername + '/user-uploads/' + 'images/').valueChanges();
    }
    getVideos(dbUsername: any): any {
        return this.db.list('all-users/' + dbUsername + '/user-uploads/' + 'videos/').valueChanges();
    }
}







