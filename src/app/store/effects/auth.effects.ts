import { Router } from '@angular/router';
import 'rxjs/add/observable/of';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import { AuthService } from '../../_services';
import { environment } from '../../../environments/environment';
import {
  AuthActionTypes,
  ForgotPassword,
  ForgotPasswordFailure,
  ForgotPasswordSuccess,
  Gauth,
  Fauth,
  LogIn,
  LogInFailure,
  LogInSuccess,
  ResetPassword,
  ResetPasswordFailure,
  ResetPasswordSuccess,
  SignUp
} from '../actions/auth.actions';

@Injectable()
export class AuthEffects {

  @Effect()
  Gauth: Observable < any > = this.actions
    .ofType(AuthActionTypes.GAUTH)
    .map((action: Gauth) => action.payload)
    .switchMap(payload => {
      return this.authService.gauth(payload).map(data => {
        if (data.ok)
          return new LogInSuccess({
            token: data.token,
            bookType: data.user.profile.bookType,
            created: data.created
          });
        else return new LogInFailure({ error: data.error });
      });
    });

  @Effect()
  Fauth: Observable < any > = this.actions
    .ofType(AuthActionTypes.FAUTH)
    .map((action: Fauth) => action.payload)
    .switchMap(payload => {
      return this.authService.fauth(payload).map(data => {
        if (data.ok)
          return new LogInSuccess({
            token: data.token,
            bookType: data.user.profile.bookType,
            created: data.created
          });
        else return new LogInFailure({ error: data.error });
      });
    });

  @Effect()
  LogIn: Observable < any > = this.actions
    .ofType(AuthActionTypes.LOGIN)
    .map((action: LogIn) => action.payload)
    .switchMap(payload => {
      return this.authService.login(payload).map(data => {
        if (data.ok) {
          localStorage.paymentStatus = data.user.paymentInfo.status;
          return new LogInSuccess({
            token: data.token,
            created: false,
            bookType: null
          });
        } else return new LogInFailure({ error: data.error });
      });
    });

  @Effect({ dispatch: false })
  LogInSuccess: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.LOGIN_SUCCESS),
    tap(action => {
      localStorage.setItem('token', action.payload.token);
      // let bookType = action.payload.bookType;
      // let created = action.payload.created;
      // if (!created) {
      //   this.router.navigateByUrl('/dashboard/projects');
      // } else if (bookType === 'fiction') {
      //   this.router.navigateByUrl(`/dashboard/projects/fiction-demo-project?appcue=${environment.APPCUSE_ID}`);
      // } else if (bookType === 'non-fiction') {
      //   this.router.navigateByUrl(`/dashboard/projects/non-fiction-demo-project?appcue=${environment.APPCUSE_ID}`);
      // } else {
      this.router.navigateByUrl('/dashboard/projects');
      // }
    })
  );

  @Effect({ dispatch: false })
  LogInFailure: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.LOGIN_FAILURE)
  );

  @Effect()
  SignUp: Observable < any > = this.actions
    .ofType(AuthActionTypes.SIGNUP)
    .map((action: SignUp) => action.payload)
    .switchMap(payload => {
      return this.authService.signUp(payload).map(data => {
        if (data.ok) {
          localStorage.paymentStatus = 'trial';
          return new LogInSuccess({
            token: data.token,
            created: true,
            bookType: data.user.profile.bookType
          });
        } else return new LogInFailure({ error: data.error });
      });
    });

  @Effect()
  ForgotPassword: Observable < any > = this.actions
    .ofType(AuthActionTypes.FORGOT_PASSWORD)
    .map((action: ForgotPassword) => action.payload)
    .switchMap(payload => {
      return this.authService
        .forgotPassword(payload)
        .map((email: any) => {
          return new ForgotPasswordSuccess({ email });
        })
        .catch(error => {
          return Observable.of(new ForgotPasswordFailure({ error }));
        });
    });

  @Effect({ dispatch: false })
  ForgotPasswordSuccess: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.FORGOT_PASSWORD_SUCCESS)
  );

  @Effect({ dispatch: false })
  ForgotPasswordFailure: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.FORGOT_PASSWORD_FAILURE)
  );

  @Effect()
  ResetPassword: Observable < any > = this.actions
    .ofType(AuthActionTypes.RESET_PASSWORD)
    .map((action: ResetPassword) => action.payload)
    .switchMap(payload => {
      return this.authService
        .resetPassword(payload)
        .map((data) => {
          if (data.ok) {
            return new ResetPasswordSuccess({ ok: true });
          } else {
            return new ResetPasswordFailure({ error: data.error });
          }
        })
        .catch(error => {
          return Observable.of(new ResetPasswordFailure({ error }));
        });
    });

  @Effect({ dispatch: false })
  ResetPasswordSuccess: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.RESET_PASSWORD_SUCCESS),
    tap(action => {
      this.router.navigateByUrl('/login');
    })
  );

  @Effect({ dispatch: false })
  ResetPasswordFailure: Observable < any > = this.actions.pipe(
    ofType(AuthActionTypes.RESET_PASSWORD_FAILURE)
  );
  constructor(
    private actions: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

}
