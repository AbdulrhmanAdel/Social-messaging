import { PagingResult } from './../../_models/Pagination';
import { AlertifyService } from './../../_services/alertify.service';
import { User } from './../../_models/User';
import { UserService } from './../../_services/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from 'src/app/_models/Pagination';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  user: User = JSON.parse(localStorage.getItem("user"));
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}]
  userParams: any = {};
  pagination: Pagination;
  constructor(private userService: UserService, private alertify: AlertifyService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data["users"].pagination
    });

    this.userParams.gender = this.user.gender === "male" ? "female" : "male";
    this.userParams.minAge = 20;
    this.userParams.maxAge = 50;
    this.userParams.orderBy = "lastActive";
  }

  loadUsers() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
      .subscribe((res: PagingResult<User[]>) => {
        this.users = res.result
        this.pagination = res.pagination
    }, err => {
      this.alertify.error(err);
    });
  }

  resetFilters() {
    this.userParams.gender = this.user.gender === "male" ? "female" : "male";
    this.userParams.minAge = 20;
    this.userParams.maxAge = 50;
    this.loadUsers();
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  // loadUsers() {
  //   this.userService.getUsers().subscribe(result => {
  //     this.users = result
  //     }, err => {
  //       this.alertify.error(err)
  //     })
  // }

}
