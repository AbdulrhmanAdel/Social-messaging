import { AuthService } from './../../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from './../../_models/Message';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import * as _ from "underscore"

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.scss']
})
export class MemberMessagesComponent implements OnInit {
  @Input() userId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(private userService: UserService,
    private  route: ActivatedRoute,
    private alertify: AlertifyService,
    private authService: AuthService) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const userId = +this.authService.getUser()["nameid"];
    this.userService.getMessagesThread(userId, this.userId)
      .subscribe((messages: Message[]) => {
        _.each(messages, (message: Message) => {
          if (message.isRead === false && message.recipientId === userId) {
            this.userService.markAsRead(message.id, userId);
          }
        })
      this.messages = messages;
      }, err => this.alertify.error(err));
  }

  sendMessage() {
    this.newMessage.recipientId = this.userId;

    this.userService.sendMessage(this.authService.getUser()["nameid"], this.newMessage).subscribe((result: Message) => {
      let message = this.messages.find(m => m.senderId == this.authService.getUser()['nameid']);
      result.senderPhotoUrl = message.senderPhotoUrl;
      result.senderKnownAs = message.senderKnownAs;
      this.messages.unshift(result);
      this.newMessage.content = "";
    }, err => this.alertify.error(err));
  }
}
