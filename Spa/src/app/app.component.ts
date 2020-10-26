import { User } from './_models/User';
import { AuthService } from './_services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'DatingApp-SPA';
  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user: User= JSON.parse(localStorage.getItem("user"))
    if (user) {
      this.authService.currentUser = user;
      if (this.authService.currentUser.photoUrl != null) {
        this.authService.changeMainPhoto(user.photoUrl)
      } else {
        this.authService.changeMainPhoto('../assets/user.png')
      }

    }
  }
}
