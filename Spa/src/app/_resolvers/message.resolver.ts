import { AuthService } from './../_services/auth.service';
import { Message } from './../_models/Message';
import { User } from './../_models/User';
import { PagingResult } from './../_models/Pagination';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesResolver implements Resolve<PagingResult<Message[]>> {
  pageSize: number = 5;
  pageNumber: number = 1;
  messageContainer: string = "Unread";

  constructor(private userService: UserService,
    private  router: Router,
    private alertify: AlertifyService,
    private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PagingResult<Message[]>> {
    return this.userService.getMessages(this.authService.getUser()["nameid"] , this.pageNumber, this.pageSize, this.messageContainer);
  }
}
