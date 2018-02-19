import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChatService, Message } from '../services/chatbot.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
declare var $: any;

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent implements OnInit, AfterViewInit {
  messages: Observable<Message[]>;
  formValue: string;

  ngAfterViewInit() {
    let scrolled = 0;
    $(document).ready(function () {
        $('#btnSendMessage').bind('click', function () {
          scrolled = scrolled + 300;
            $('#chat-scroll').animate({
              scrollTop : scrolled
            });
        });
    });
  }

  constructor(public chat: ChatService) { }
  ngOnInit() {
    // appends to array after each new message is added to feedSource
    this.messages = this.chat.conversation.asObservable()
        .scan((acc, val) => acc.concat(val) );
  }
  sendMessage() {
    this.chat.converse(this.formValue);
    this.formValue = '';
  }
}
