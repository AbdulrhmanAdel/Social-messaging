import { Message } from './../_models/Message';
import { PagingResult } from './../_models/Pagination';
import { map, catchError } from 'rxjs/operators';
import { User } from './../_models/User';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl: string = environment.apiUrl;


  constructor(private http: HttpClient) { }

  getUsers(page?: number, itemsPerPage?: number, userParams?: any, likeParams?: string) {
    const pagingResult: PagingResult<User[]> = new PagingResult<User[]>();
    let queryString = "?";
    if (page != null && itemsPerPage != null) {
      queryString += "pageNumber=" + page + "&pageSize=" + itemsPerPage + "&";
    }
    if (likeParams === "likers") {
      queryString += "Likers=true&";
    }

    if (likeParams === "likees") {
      queryString += "Likees=true&";
    }
    if (userParams != null) {
      queryString +=
        "minAge=" + userParams.minAge +
        "&maxAge=" + userParams.maxAge +
        "&gender=" + userParams.gender +
        "&orderBy=" + userParams.orderBy
    }
    return this.http
      .get(this.baseUrl + "users" + queryString, {headers: this.jwt(), observe: "response"})
      .pipe(map((response) => {
        pagingResult.result = response.body as unknown as User[];
        if (response.headers.get('Pagination') != null) {
          pagingResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return pagingResult;
      }))
      // .pipe(catchError(this.handleError));
  }

  getUser(id: number): Observable<User> {
    return this.http.get(this.baseUrl + "users/" + id, {headers: this.jwt()}).pipe(map(response => <User>response));
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + "users/" + id, user, {headers: this.jwt()}).pipe(catchError(this.handleError));
  }

  setMain(id: number, userId: number) {
    return this.http.post(this.baseUrl + "users/" + userId + "/photos/" + id + "/setMain", {} ,{headers: this.jwt()}).pipe(catchError(this.handleError));
  }

  deletePhoto(id: number, userId: number) {
    return this.http.delete(this.baseUrl + "users/" + userId + "/photos/" + id , {headers: this.jwt()}).pipe(catchError(this.handleError));
  }

  sendLike(id: number, recipientId: number) {
    return this.http.post(this.baseUrl + "users/" + id + "/like/" + recipientId, {}, {headers: this.jwt()})
      .pipe(catchError(this.handleError));
  }
  private jwt() {
    let token = localStorage.getItem("token");
    if (token) {
      let headers = new HttpHeaders({'Authorization': 'Bearer ' + token});
      return headers;
    }
  }

  getMessages(id: number, page?: number, itemPerPage?: number, messageContainer?: string) {
    const pagingResult = new PagingResult<Message[]>();
    let queryString = "?MessageContainer=" + messageContainer + "&";
    if (page != null && itemPerPage != null) {
      queryString += "&pageNumber=" + page + "&pageSize=" + itemPerPage;
    }
    return this.http.get(this.baseUrl + "users/" + id + "/messages" + queryString, {headers: this.jwt(), observe: "response"})
      .pipe(map(response => {
        pagingResult.result = response.body as unknown as Message[];
        if (response.headers.get('Pagination') != null) {
          pagingResult.pagination = JSON.parse(response.headers.get('Pagination'));
      }
      return pagingResult;
    })).pipe(catchError(this.handleError));
  }

  getMessagesThread(id: number, recipientId: number) {
    return this.http.get(this.baseUrl + "users/" + id + "/messages/thread/" + recipientId, {headers: this.jwt()})
      .pipe(catchError(this.handleError));
  }

  sendMessage(id: number, message: Message) {
    return this.http.post(this.baseUrl + "users/" + id + "/messages" , message, {headers: this.jwt()})
      .pipe(catchError(this.handleError));
  }

  deleteMessage(id: number, userId: number) {
    return this.http.post(this.baseUrl + "users/" + userId + "/messages/" + id, {}, {headers: this.jwt()})
      .pipe(catchError(this.handleError));
  }

  markAsRead(id: number, userId: number) {
    return this.http.post(this.baseUrl + "users/" + userId + "/messages/" + id + "/read", {}, {headers: this.jwt()})
      .pipe(catchError(this.handleError))
      .subscribe();
  }

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
        // server-side error
        errorMessage = `${error.error}`;
    }
    return throwError(errorMessage);
  }
}
