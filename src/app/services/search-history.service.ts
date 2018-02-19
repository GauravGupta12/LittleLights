import { Injectable } from '@angular/core';

@Injectable()
export class SearchHistoryService {
    private searchHistory: string[] = [];

    constructor() { }

    addToSearchHistory(searchEntry: string) {
        this.searchHistory.push(searchEntry);
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    clearSearch() {
        this.searchHistory = [];
    }

}
