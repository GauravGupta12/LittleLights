import {Component, OnInit, Injectable} from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase} from 'angularfire2/database';
import { Upload } from '../models/upload.model';
import * as firebase from 'firebase';
import { GalleryImage } from '../models/galleryImage.model';
import { AuthService } from '../core/auth.service';
import { AngularFireList } from 'angularfire2/database/interfaces';


@Injectable()
export class UploadService implements OnInit {
    user: any;
    dbUsername: string;
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
    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        this.user.providerData.forEach( (p) => {
            if ( p.providerId === 'twitter.com') {
                this.dbUsername = 'twtr' + this.user.displayName.replace(' ', '');
            } else {
                this.dbUsername = this.user.email.replace('.', '');
            }
        });
    }
    uploadImage(upload: Upload, dbUsername: any) {
        const storageRef =  firebase.storage().ref();
        const uploadTask = storageRef.child(`all-users/${dbUsername}/user-uploads/images/${upload.file.name}`)
        .put(upload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                upload.progress = Math.floor((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);
            },
            (error) => { // upload failed
                // console.log(error);
            },
            () => {
                upload.url = uploadTask.snapshot.downloadURL;
                upload.name = upload.file.name;
                this.saveImage(upload, dbUsername);
                upload = null;
            });
    }
    saveImage(upload: Upload, dbUsername: any) {
        const newImageKey = firebase.database().ref().child(`all-users/${dbUsername}/user-uploads/images/`).push().key;
        upload.key = newImageKey;
        const updates = {};
        updates[`all-users/${dbUsername}/user-uploads/images/` + newImageKey] = upload;
        firebase.database().ref().update(updates)
        .then( () => {
            // alert('upload successful');
        })
        .catch((error) => {
            // console.log(error);
        });

        // console.log('file saved ' + upload.url);
    }
    uploadVideo(upload: Upload, dbUsername: any) {
        const storageRef =  firebase.storage().ref();
        const uploadTask = storageRef.child(`all-users/${dbUsername}/user-uploads/videos/${upload.file.name}`)
        .put(upload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                upload.progress = Math.floor((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);
            },
            (error) => { // upload failed
                // console.log(error);
            },
            () => {
                upload.url = uploadTask.snapshot.downloadURL;
                upload.name = upload.file.name;
                this.saveVideo(upload, dbUsername);
                upload = null;
            });
    }
    saveVideo(upload: Upload, dbUsername: any) {
        const newVideoKey = firebase.database().ref().child(`all-users/${dbUsername}/user-uploads/videos/`).push().key;
        upload.key = newVideoKey;
        const updates = {};
        updates[`all-users/${dbUsername}/user-uploads/videos/` + newVideoKey] = upload;
        firebase.database().ref().update(updates)
        .then( () => {
            // alert('upload successful');
        })
        .catch((error) => {
            // console.log(error);
        });
    }

}

