import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { User } from '../_models/User';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberEditResolver implements Resolve<User> {

  constructor(private userService: UserService,
    private  router: Router,
    private alertify: AlertifyService,
    private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> | Promise<User> {
    return this.userService.getUser(this.authService.getUser()['nameid']);
  }
}
