import { Router } from '@angular/router';
import { User } from './../_models/User';
import { AlertifyService } from './../_services/alertify.service';
import { AuthService } from './../_services/auth.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  user: User;
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private auth: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
    ) { }

  ngOnInit() {
    this.createRegisterForm();
    this.bsConfig = {
      containerClass: "theme-red"
    }
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender:['male'],
      userName: ['', [Validators.required]],
      knownAs: ['', Validators.required],
      dateBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['',
      [ Validators.required, Validators.maxLength(8), Validators.minLength(4) ]],
      confirmPassword: ['', [Validators.required]]
    }, {validators: this.passwordMatchValidator});
  }

  passwordMatchValidator(f: FormGroup) {
    return f.get("password").value === f.get("confirmPassword").value ? null : {"mismatch": true};
  }

  register() {
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.auth.register(this.user).subscribe(() => {
          this.alertify.success("Registration success")
      }, () => this.alertify.error("cant register"), () => {
        this.auth.login(this.user).subscribe(() => {
          this.router.navigate['/members']
        })
      })
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
