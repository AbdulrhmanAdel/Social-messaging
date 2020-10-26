import { Injectable, OnInit } from '@angular/core';
import { User } from './../_models/User';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import * as jwt_decode from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService  {
  baseUrl = "https://localhost:5001/api/auth/";
  userToken: any;
  currentUser: User;
  private photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private http:HttpClient) { }


  changeMainPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }

  login(user: User) {
   return this.http.post(this.baseUrl + "login", user).pipe(map((response: Response) => {
    if (response) {
      localStorage.setItem('token', response['tokenString']);
      localStorage.setItem('user',JSON.stringify(response["user"]));
      this.userToken = response['tokenString'];
      this.currentUser = response["user"];
      if (this.currentUser.photoUrl != null) {
        this.changeMainPhoto(this.currentUser.photoUrl);
      } else {
        this.changeMainPhoto('../../assets/user.png');
      }
    }
   })).pipe(catchError(this.handleError));
  }

  register(user: User) {
    return this.http.post(this.baseUrl + "register", user).pipe(catchError(this.handleError));
  }

  loggedIn() {
    const token = this.getToken();
    return !!token;
  }

  private handleError(error: any) {
    const applicationError = error.get("Application-Error");
    if (applicationError)
      return Observable.throw(applicationError);

    const serverError = error.json();
    let modelStateError = '';
    if (serverError)
    {
      for (const key in serverError)
      {
        if (serverError[key])
          modelStateError += serverError[key] + "\n"
      }
    }

    Observable.throw(modelStateError || "Server Error");
  }

  private getToken() {
    return localStorage.getItem("token");
  }

  getUser() {
    if (this.loggedIn())
      return jwt_decode(this.getToken());
    else
      return ""
  }
}
