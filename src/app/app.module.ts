import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {ɵROUTER_PROVIDERS} from '@angular/router';


import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import {  AngularFireAuth  } from 'angularfire2/auth';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import {SearchHistoryComponent} from './search-history/search-history.component';
import { PageNotFoundComponent } from './others/pagenotfound/pagenotfound.component';
import { ChatDialogComponent } from './chatbot/chat-dialog.component';

// dashboard components
import {DashboardComponent} from './dashboard/dashboard.component';
import {MyProfileComponent} from './dashboard/my-profile/my-profile.component';
import {AllPostsComponent} from './dashboard/user-posts/user-posts.component';
import {UserFriendsComponent} from './dashboard/friends/friends.component';
import {UserSettingsComponent} from './dashboard/user-settings/user-settings.component';
import {GalleryComponent} from './dashboard/gallery/gallery.component';
import {ImageDetailComponent} from './dashboard/image-detail/image-detail.component';
import {FriendProfileComponent} from './dashboard/friend-profile/friend-profile.component';
import {UserNotificationService} from './dashboard/services/user-notifications.service';
import {IndividualPostComponent} from './dashboard/individual-post/individual-post.component';
import {MyStoriesComponent} from './dashboard/my-stories/my-stories.component';
import {MyCollectionComponent} from './dashboard/my-collection/my-collection.component';
import {HelpAndFAQComponent} from './dashboard/help-faq/help-faq.component';
import {ReachOutMessageComponent} from './dashboard/reachout-messages/reachout-messages.component';
// pipes
import {FilterPipe} from './pipes/filter-posts.pipe';

// auth
import { LoggedInGaurd } from './login/logged.in.gaurd';
import { AuthService, Auth_Providers } from './core/auth.service';
// services
import { ChatService } from './services/chatbot.service';
import { GiphySearchService } from './services/giphy-search.service';
import {SearchHistoryService} from './services/search-history.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { ImageService } from './services/imageService';
import { UploadService } from './services/upload.service';
import { UserProfileService } from './services/user-profile.service';

import { EqualValidator } from './dashboard/equal-validator.directive';

export const firebaseConfig = {
  apiKey: 'your-key',
  authDomain: 'xyz.firebaseapp.com',
  databaseURL: 'https://xyz.firebaseio.com',
  projectId: 'xyz',
  storageBucket: 'xyz.appspot.com',
  messagingSenderId: '12345678900'
};

const dashboardRoutes: Routes = [
  { path: '', redirectTo: 'stories', pathMatch: 'full' },
  { path: 'stories', component: AllPostsComponent },
  { path: 'my-stories', component: MyStoriesComponent },
  { path: 'my-collection', component: MyCollectionComponent },
  { path: 'my-profile', component: MyProfileComponent },
  { path: 'friend-profile/:id', component: FriendProfileComponent },
  { path: 'user-story/:id', component: IndividualPostComponent },
  { path: 'friends', component: UserFriendsComponent },
  { path: 'help-faq', component: HelpAndFAQComponent },
  { path: 'reachout-messages', component: ReachOutMessageComponent },
  { path: 'gallery', component: GalleryComponent }
];
// twitter -- 'https://myfirebaseapp1-3ecc5.firebaseapp.com/__/auth/handler'
// github -- 'https://myfirebaseapp1-3ecc5.firebaseapp.com/__/auth/handler'
const routes: Routes = [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'image/:id', component: ImageDetailComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [LoggedInGaurd], children: dashboardRoutes },
      { path: '**', component: PageNotFoundComponent  }
  ];

@NgModule({
  declarations: [
    MyProfileComponent,
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    PageNotFoundComponent,
    SearchHistoryComponent,
    ChatDialogComponent,
    AllPostsComponent,
    UserFriendsComponent,
    UserSettingsComponent,
    GalleryComponent,
    ImageDetailComponent,
    FilterPipe,
    FriendProfileComponent,
    IndividualPostComponent,
    MyStoriesComponent,
    MyCollectionComponent,
    EqualValidator,
    HelpAndFAQComponent,
    ReachOutMessageComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    JsonpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes, {useHash : true}),
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [
    ɵROUTER_PROVIDERS,
    { provide : LocationStrategy, useClass : HashLocationStrategy},
    Auth_Providers,
    LoggedInGaurd,
    ChatService,
    AngularFireAuth,
    AngularFireDatabase,
    GoogleAnalyticsService,
    GiphySearchService,
    SearchHistoryService,
    ImageService,
    UploadService,
    UserProfileService,
    UserNotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
