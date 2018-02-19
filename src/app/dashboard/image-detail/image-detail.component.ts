import {Component, OnInit} from '@angular/core';
import { ImageService } from '../../services/imageService';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../core/auth.service';


@Component({
    selector: 'app-image-detail',
    templateUrl: './image-detail.component.html',
    styleUrls: ['./image-detail.component.css']
})
export class ImageDetailComponent implements OnInit {
    public imageUrl = '';
    user: any;
    constructor(private imgSvc: ImageService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private afdb: AngularFireDatabase,
                private router: Router) {

                this.user = this.authService.getCurrentUser();
    }
    getImageUrl(paramId: string) {
        const key = paramId.split('yuiop')[0];
        const authorUID = paramId.split('yuiop')[1];
        let dbUsername = '';
        if (authorUID === '') {
            firebase.database().ref().child(`all-users/userUIDs/${this.user.uid}`).once('value',
            (snapshot) => {
                if (snapshot.val()) {
                    dbUsername = snapshot.val().dbUsername;
                    firebase.database().ref().child(`all-users/${dbUsername}/user-uploads/images/${key}`).once('value',
                    (snapshot1) => {
                        if (snapshot1.val()) {
                            this.imageUrl = snapshot1.val().url;
                        }
                    });
                }
            });
        } else {
            firebase.database().ref().child(`all-users/userUIDs/${authorUID}`).once('value',
            (snapshot) => {
            if (snapshot.val()) {
                dbUsername = snapshot.val().dbUsername;
                if (key === authorUID) {
                    this.imageUrl = snapshot.val().photoURL;
                } else {
                    this.imgSvc.getImage(key, dbUsername)
                    .then( img => {
                        this.imageUrl = img.url;
                    });
                }
            }
        });
        }
    }

    ngOnInit() {
        this.getImageUrl(this.route.snapshot.params['id']);
    }

}
