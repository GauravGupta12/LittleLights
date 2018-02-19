import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GiphySearchService {

  constructor(private http: Http) { }
  
      search(searchText: string) {
          let urlSearchParams = new URLSearchParams();
          urlSearchParams.set('api_key', 'tlRoxu3mLJ8oWMSe3NcURJGfghPDsqT7');
          urlSearchParams.set('q', searchText);
          urlSearchParams.set('limit', '5');
          urlSearchParams.set('offset', '0');
          urlSearchParams.set('rating', 'G');
          urlSearchParams.set('lang', 'en');
  
          return this.http
              .get('https://api.giphy.com/v1/gifs/search', { params: urlSearchParams })
              .toPromise()
              .then((response) => response.json());
      }
}
