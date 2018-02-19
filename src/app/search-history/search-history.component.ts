import { Component, OnInit } from '@angular/core';

import { SearchHistoryService } from '../services/search-history.service';

@Component({
    selector: 'app-search-history',
    templateUrl: './search-history.component.html'
})
export class SearchHistoryComponent implements OnInit {
    searchHistory: string[];

    constructor(private searchHistoryService: SearchHistoryService) { }

    ngOnInit() {
        this.searchHistory = this.searchHistoryService.getSearchHistory();
    }

    clearSearch() {
        this.searchHistoryService.clearSearch();
        this.searchHistory = [];
    }

}
