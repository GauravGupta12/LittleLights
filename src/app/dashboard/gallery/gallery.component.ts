import {Component, OnInit, Injectable, OnChanges, AfterViewInit, OnDestroy} from '@angular/core';
import { ImageService } from '../../services/imageService';
import { Observable } from 'rxjs/Observable';
import { GalleryImage } from '../../models/galleryImage.model';
import { Upload } from '../../models/upload.model';
import { UploadService } from '../../services/upload.service';
import * as _ from 'lodash';
declare var $: any;
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../core/auth.service';



@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    images: Observable<any[]>;
    videos: Observable<any[]>;
    files: FileList;
    upload: Upload;
    user: any;
    dbUsername: any;
    dbEmail = '';

    constructor(private imageService: ImageService, private authService: AuthService,
                private afdb: AngularFireDatabase,
                private uploadSvc: UploadService) {
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

    uploadFiles() {
        const filesToUpload = this.files;
         if (filesToUpload[0].type.includes('video')) {
            if (filesToUpload[0].size <= 11534336) { // 10485760
                const filesIdx = _.range(filesToUpload.length);
                _.each(filesIdx, (idx) => {
                    // console.log(filesToUpload[idx]);
                    this.upload = new Upload(filesToUpload[idx]);
                    this.upload.postUID = '';
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
                this.upload.postUID = '';
                this.uploadSvc.uploadImage(this.upload, this.dbUsername);
            });
         }
    }
    deleteImage(imageUID: any, filename: string, postUID: string) {
        if (!postUID) {
            const deleteConfirmation = confirm('Are you sure, want to delete the picture ?');
            if (deleteConfirmation) {
                const storageRef =  firebase.storage().ref();
                // this.newLocalImageKeyAndURL = this.uploadSvc.keepImageATLocal(this.upload);
                const deleteTask = storageRef.child(`all-users/${this.dbUsername}/user-uploads/images/${filename}`)
                .delete()
                .then( () => {
                    const updates = {};
                    updates[`all-users/${this.dbUsername}/user-uploads/images/${imageUID}`] = null;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        alert('image deleted');
                    })
                    .catch((error) => {
                        // alert(error);
                    });
                })
                .catch((errorStorage) => {
                    // alert(errorStorage);
                });
            }
        } else {
            alert('Image cannot be delete, associated with a post');
        }
    }
    deleteVideo(videoUID: any,  filename: string, postUID: string) {
        if (!postUID) {
            const deleteConfirmation = confirm('Are you sure, want to delete the video ?');
            if (deleteConfirmation) {
                const storageRef =  firebase.storage().ref();
                // this.newLocalImageKeyAndURL = this.uploadSvc.keepImageATLocal(this.upload);
                const deleteTask = storageRef.child(`all-users/${this.dbUsername}/user-uploads/videos/${filename}`)
                .delete()
                .then( () => {
                    const updates = {};
                    updates[`all-users/${this.dbUsername}/user-uploads/videos/${videoUID}`] = null;
                    firebase.database().ref().update(updates)
                    .then(() => {
                        alert('Video deleted');
                    })
                    .catch((error) => {
                        alert(error);
                    });
                })
                .catch((errorStorage) => {
                    alert(errorStorage);
                });
            }
        } else {
            alert('Video cannot be deleted, associated with a post');
        }
    }
    handleFiles(event) {
        this.files = event.target.files;
    }

    ngOnInit() {
        this.images = this.imageService.getImages(this.dbUsername);
        this.videos = this.imageService.getVideos(this.dbUsername);
    }
    ngOnChanges() {
        this.images = this.imageService.getImages(this.dbUsername);
        this.videos = this.imageService.getVideos(this.dbUsername);
    }
    ngOnDestroy() {
    }
    ngAfterViewInit() {
        $(document).ready(function () {

            if ($(window).width() < 768) {
                $('#divUserGallery').addClass('user-post-margin');
            } else {
                $('#divUserGallery').removeClass('user-post-margin');
            }

            $('#idVideo').bind('hover', function () {
                $('#lblShowVideoName').show();
           });
            $('#btnAddPictures').bind('click', function () {
                 $('#inputFiles').val('');
            });
            $('#inputFiles').bind('change', function () {
                const value = $(this).val();
                if (value !== '') {
                    $('#btnUploadFiles').css('display', 'inline');
                } else {
                    $('#btnUploadFiles').css('display', 'none');
                }
            });

        });
      }

}







