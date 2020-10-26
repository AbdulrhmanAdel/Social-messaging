import { User } from './../_models/User';
import { PagingResult } from './../_models/Pagination';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListsResolver implements Resolve<PagingResult<User[]>> {
  pageSize: number = 5;
  pageNumber: number = 1;
  likesParams: string = "likers";
  constructor(private userService: UserService, private  router: Router, private alertify: AlertifyService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PagingResult<User[]>> {
    return this.userService.getUsers(this.pageNumber, this.pageSize, null, this.likesParams);
  }
}
