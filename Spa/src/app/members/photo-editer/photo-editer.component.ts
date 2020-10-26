import { AlertifyService } from './../../_services/alertify.service';
import { UserService } from './../../_services/user.service';
import { AuthService } from './../../_services/auth.service';
import { environment } from './../../../environments/environment';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Photo } from 'src/app/_models/Photo';
import * as underscore from 'underscore';
@Component({
  selector: 'app-photo-editer',
  templateUrl: './photo-editer.component.html',
  styleUrls: ['./photo-editer.component.scss']
})
export class PhotoEditerComponent implements OnInit {
  @Input() photos: Photo[];
  @Output('photoChange') getMemberPhotoChange = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;
  userId: number;

  constructor(private authService: AuthService,
    private userService: UserService,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.userId = this.authService.getUser()['nameid'];
    this.initializeUploader();
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  setMain(photo: Photo) {
    this.userService.setMain(photo.id, this.userId).subscribe(response => {
      this.currentMain = underscore.findWhere(this.photos, {isMain: true});
      this.currentMain.isMain = false;
      photo.isMain = true;
      this.alertify.success("Set Main Succcessfully");
      this.authService.changeMainPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem("user", JSON.stringify(this.authService.currentUser));
    }, err => {
      this.alertify.error(err);
    });
  }

  deletePhoto(photoId: number) {
    this.alertify.confirm("Are you sure you want to delete this photo?", () => {
      this.userService.deletePhoto(photoId, this.userId).subscribe(() => {
        this.photos.splice(underscore.findIndex(this.photos, { id: photoId }), 1);
        this.alertify.success("Photo deleted successfully");
      }, err => this.alertify.error("Failed to delete photo"));
    });
  }




  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + "users/" + this.userId + "/photos",
      authToken: "Bearer " + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ["image"],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    })

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      console.log(response);
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
        if (photo.isMain) {
          this.authService.changeMainPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem("user", JSON.stringify(this.authService.currentUser));
        }
      }
    };

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };
  }
}
