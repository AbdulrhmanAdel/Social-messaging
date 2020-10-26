import { ActivatedRoute } from '@angular/router';
import { Pagination, PagingResult } from './../_models/Pagination';
import { Message } from './../_models/Message';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import * as _ from "underscore"

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer: string = "Unread";

  constructor(private userService: UserService,
    private  route: ActivatedRoute,
    private alertify: AlertifyService,
    private authService: AuthService) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    this.userService.getMessages(this.authService.getUser()["nameid"], this.pagination.currentPage,
      this.pagination.itemsPerPage, this.messageContainer)
      .subscribe((res: PagingResult<Message[]>) => {
        this.messages = res.result;
        this.pagination = res.pagination
      }, err => {
        this.alertify.error(err);
      });
  }

  deleteMessage(id: number) {
    this.alertify.confirm("Are you sure you want to delete this message?", () => {
      this.userService.deleteMessage(id, this.authService.getUser()['nameid']).subscribe(res => {
        this.messages.splice(_.findIndex(this.messages, {id: id}), 1);
        this.alertify.success("Message deleted successfully")
      }, err => this.alertify.error(err));
    });

  }
  pageChanged(event: any) {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }


}
