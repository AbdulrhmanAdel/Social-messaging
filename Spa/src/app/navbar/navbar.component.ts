import { AlertifyService } from './../_services/alertify.service';
import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../_models/User';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  model: any = {};
  userName: string;
  photoUrl: string;
  user: User;
  
  constructor(public auth: AuthService,
              private alertify: AlertifyService,
              private router: Router) { }

  ngOnInit(): void {
    this.auth.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.userName = this.auth.getUser()["unique_name"];
  }

  login() {
    this.auth.login(this.model).subscribe(data => {
      this.alertify.success("logged in successfully")
    }, err => {
      this.alertify.error("cant log in")
    }, () => {
      this.router.navigate['home'];
      this.userName = this.auth.getUser()["unique_name"];
    });
  }

  logout() {
    this.auth.userToken = null;
    this.auth.currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.alertify.message("logged out")
    this.router.navigate['home'];
  }

  loggedIn() {
    return this.auth.loggedIn();
  }
}
