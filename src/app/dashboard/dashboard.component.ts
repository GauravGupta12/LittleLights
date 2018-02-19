import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { AuthService } from '../core/auth.service';
declare var ga: Function;


import { SearchHistoryService } from '../services/search-history.service';
import { GiphySearchService } from '../services/giphy-search.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    searchItem: string;
    giphySearchResults: any[];
    currentUser: any;
    currentUserId: any;

    constructor(
        private router: Router,
        private authService: AuthService,
        private searchGiphyService: GiphySearchService,
        private searchHistoryService: SearchHistoryService,
        private gaService: GoogleAnalyticsService
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                ga('set', 'page', event.urlAfterRedirects);
                ga('send', 'pageview');
            }
        });
        // this.authenticated = authService.authenticated;
        // this.currentUser = authService.currentUser;
        // this.currentUserId = authService.currentUserId;
    }
    submitGAEvent(typeOfSearch: string) {
        this.gaService.emitEvent('Searchcategory', typeOfSearch, 'SearchLabel', 10);
    }

    searchWiki() {
        this.resetSearchResults();
        this.searchHistoryService.addToSearchHistory(this.searchItem + ' - Wiki search - ' + this.getTimeStamp());
        this.submitGAEvent('WikiSearch');
    }

    searchGiphy() {
        this.resetSearchResults();
        this.searchHistoryService.addToSearchHistory(this.searchItem + ' - Giphy search - ' + this.getTimeStamp());
        this.searchGiphyService.search(this.searchItem).then(searchResults => this.giphySearchResults = searchResults.data);
        this.submitGAEvent('GiphySearch');
    }

    getTimeStamp(): string {
        return (new Date().toUTCString());
    }

    resetSearchResults() {
        this.giphySearchResults = [];
    }
    ngOnInit() {
    }

}
