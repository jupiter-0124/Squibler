import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  Store
} from '@ngrx/store';
import {
  Observable
} from 'rxjs/Observable';
import {
  AppState,
  selectAuthState
} from '../../../store/app.states';
import {
  SignUp
} from '../../../store/actions/auth.actions';
import { SegmentService } from 'ngx-segment-analytics';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  registerError: string;
  getState: Observable<any>;
  errorMessage: string | null;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private segment: SegmentService

  ) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.segment.page('[Auth] - Register');
    this.getState.subscribe(state => {
      this.registerError = state.errorMessage;
      this.loading = false;
    });
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
      password: ['', [Validators.required]]
    });
  }
  get registerFormState() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.segment.track('[Auth] - Register');
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.store.dispatch(new SignUp(this.registerForm.value));
  }

  redirect(value): void {
    window.open(value, '_blank');
  }
}
