import {Component, OnInit} from '@angular/core';
import { ImageService } from '../../services/imageService';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../core/auth.service';


@Component({
    selector: 'app-help-faq',
    templateUrl: './help-faq.component.html'
})
export class HelpAndFAQComponent implements OnInit {
    user: any;
    constructor(private imgSvc: ImageService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private afdb: AngularFireDatabase,
                private router: Router) {

                this.user = this.authService.getCurrentUser();
    }

    ngOnInit() {

    }
}
