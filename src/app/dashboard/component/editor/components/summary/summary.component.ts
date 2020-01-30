import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  AppState,
  selectIdeaState,
  selectProjectState
} from '../../../../../store/app.states';
import { SectionUpdate } from '../../../../../store/actions/section.actions';
import { getFroalaOptions } from '../../../../../helper/helper';
import { SegmentService } from 'ngx-segment-analytics'
import { environment } from '../../../../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnChanges {
  summaryForm: FormGroup;
  getState: Observable<any>;
  getIdeasState: Observable<any>;
  currentIdea: any;
  saveIdeaMethod: any;
  @ViewChild('summaryName')
  summaryName: ElementRef;

  @Output()
  projectData = new EventEmitter();
  sectionFlag = false;
  @Input()
  globalId;
  @Input()
  project;
  @Input()
  parentSummarySubject: Subject<any>;
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private segment: SegmentService
  ) {
    this.getState = this.store.select(selectProjectState);
    this.getIdeasState = this.store.select(selectIdeaState);
  }
  title: 'ideas';
  public editorContent = "My Document's Title";
  _that = this;

  private froalaImageError = (_e, editor, error, response) => {
    if (error.code === 3 || error.code === 4) {
      alert('Image too big. Max size is 1MB');
    }
  };

  options = getFroalaOptions({
    'froalaEditor.image.error': this.froalaImageError
  });

  insertFroalaArea(project) {
    this.options.placeholderText;
    if (project) {
      this.summaryForm = this.formBuilder.group({
        title: [
          !this.sectionFlag ? project.title : project.label,
          [Validators.required],
        ],
        description: [
          project.description
            ? project.description === 'New project description' ||
              project.description === 'no description'
              ? ''
              : project.description
            : project.synopsis === 'No synopsis here'
              ? ''
              : project.synopsis,
          [Validators.required],
        ]
      });
    }
  }
  saveProject() {
    if ((this.project && this.project.copyright) || this.project.synopsis) {
      this.project.projectId = this.project.id;
      this.project.copyright = 'qwert';
      this.project.dedication = 'zxcv';
      if (this.project.description || this.project.description === '') {
        this.project.input = this.summaryForm.value.title;
        this.project.textarea = this.summaryForm.value.description;
        // this.store.dispatch(new ProjectEdit(this.project));
        this.sectionFlag = false;
      }
      if (this.project.synopsis || this.project.synopsis === '') {
        if (this.project.projectId) {
          this.project.title = this.summaryForm.value.title;
          this.project.synopsis = this.summaryForm.value.description;
          const sectionRequest = {
            PUT: {
              sections: [this.project],
            }
          };
          this.store.dispatch(new SectionUpdate(sectionRequest));
          this.sectionFlag = false;
        } else {
          this.project.label = this.summaryForm.value.title;
          this.project.synopsis = this.summaryForm.value.description;
          document.getElementsByClassName(
            'allSection'
          )[0].children[0].textContent = this.summaryForm.value.title;
        }
      }
    } else {
      document.getElementsByClassName('title-text')[0][
        'value'
      ] = this.summaryForm.value.title;
      const projectInfo = {
        title: this.summaryForm.value.title,
        description: this.summaryForm.value.description
      };
      this.projectData.emit(projectInfo);
    }
  }
  ngOnChanges() {
    if (this.project && this.project.label) {
      this.sectionFlag = true;
    } else {
      this.sectionFlag = false;
    }
    this.insertFroalaArea(this.project);
    // this.summaryName.nativeElement.focus();
  }
  ngOnInit() {
    this.segment.identify(localStorage.getItem('userId'), {
      environment: environment.NAME,
      userId: localStorage.getItem('userId'),
    });
    this.parentSummarySubject.subscribe(event => {
      if (this.project !== this.summaryForm.value && !event) {
        this.insertFroalaArea(this.project);
      }
      if (event) {
        this.saveProject();
      }
    });
    const _thisVar = this;
    $.FroalaEditor.RegisterCommand('Save Project', {
      title: 'Save Project',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      callback() {
        _thisVar.saveProject();
      }
    });
    $.FroalaEditor.DefineIcon('h1', { NAME: 'heading' });
    $.FroalaEditor.RegisterCommand('heading', {
      title: 'Insert title',
      icon: 'h1',
      focus: false,
      undo: true,
      refreshAfterCallback: false,
      callback() {
        this.html.insert(`<h1>${this.html.getSelected()}</h1>`);
      }
    });
    this.insertFroalaArea(this.project);
  }
}
