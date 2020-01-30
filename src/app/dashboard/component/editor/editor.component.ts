import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectProjectState } from '../../../store/app.states';
import { SegmentService } from 'ngx-segment-analytics';
import { environment } from '../../../../environments/environment';
import { getFroalaOptions } from '../../../helper/helper';
import { ActivatedRoute } from '@angular/router';
import { Init, UpdateProjectContent, UpdateProjectTitle, UpdateSectionText, UpdateSectionTitle } from '../../../store/actions/project.actions';
import _ from 'lodash';
declare var $: any;

@Component({
  selector: 'dashboard-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  active = false;
  project: any;
  projectId: string;
  editorHtml = '';
  exportedFile = undefined;
  projectloader = true;
  editorFull = false;
  projectExportOptions = false;
  exportReady = false;
  exporting = false;
  sidebarActive = false;
  exportFormat = '';
  workingOn = 'project';
  section;
  editingProject = false;
  board = undefined;
  sectionOpened;
  projectSubscription: Subscription;
  getProjectState: Observable < any > ;
  updated = false;
  selectedSectionId = undefined;

  protected options = {
    ...getFroalaOptions({
      'froalaEditor.mousedown': this.froalaMousedown,
      'froalaEditor.contentChanged': (e, editor) => this.updateSection(e, editor),
      'froalaEditor.image.uploaded': this.froalaImageUploaded,
      'froalaEditor.image.error': this.froalaImageError,
      'froalaEditor.initialized': (e, editor) => {
        editor.toolbar.show();
      }
    }),
    toolbarContainer: '#toolbarContainer'
  };
  protected sectionOptions = {
    ...getFroalaOptions({
      'froalaEditor.mousedown': this.froalaMousedown,
      'froalaEditor.contentChanged': (e, editor) => this.updateSectionById(e, editor),
      'froalaEditor.image.uploaded': this.froalaImageUploaded,
      'froalaEditor.image.error': this.froalaImageError,
      'froalaEditor.initialized': (e, editor) => {
        editor.toolbar.hide();
      },
      'froalaEditor.focus': (e, editor) => {
        editor.toolbar.show();
      },
      'froalaEditor.blur': (e, editor) => {
        editor.toolbar.hide();
      }
    }),
    toolbarContainer: '#toolbarContainer'
  };
  protected projectOptions = {
    ...getFroalaOptions({
      'froalaEditor.mousedown': this.froalaMousedown,
      'froalaEditor.contentChanged': (e, editor) => this.updateProjectContent(e, editor),
      'froalaEditor.image.uploaded': this.froalaImageUploaded,
      'froalaEditor.image.error': this.froalaImageError,
      'froalaEditor.initialized': (e, editor) => {
        editor.toolbar.hide();
      },
      'froalaEditor.focus': (e, editor) => {
        editor.toolbar.show();
      },
      'froalaEditor.blur': (e, editor) => {
        editor.toolbar.hide();
      }
    }),
    // tslint:disable-next-line:max-line-length
    placeholderText: this.project && this.project.sections && !this.project.sections.length ? 'Welcome to the editor! This is where you put the pen to the pad. If you want to avoid any distractions try our “Distraction Free Mode.” If you’re looking to do some planning, try switching to the planner, where you can add research, notes, and custom Boards. You can also create an Outline for your project, and use it to navigate to different sections of your text. Good luck and happy writing!' : 'Start writing here...',
    toolbarContainer: '#toolbarContainer'
  };
  protected projectTitleOptions = {
    ...getFroalaOptions({
      'froalaEditor.mousedown': this.froalaMousedown,
      'froalaEditor.contentChanged': (e, editor) => this.updateProjectTitle(e, editor),
      'froalaEditor.initialized': (e, editor) => {
        editor.toolbar.hide();
      },
      'froalaEditor.focus': (e, editor) => {
        editor.toolbar.show();
      },
      'froalaEditor.blur': (e, editor) => {
        editor.toolbar.hide();
      }
    }),
    placeholderText: 'Untitled project',
    multiLine: false,
    editorClass: 'project-title-editor',
    toolbarButtons: [
      'fontFamily',
      'bold',
      'italic',
      'underline'
    ],
    toolbarContainer: '#toolbarContainer'
  };
  protected sectionTitleOptions = {
    ...getFroalaOptions({
      'froalaEditor.mousedown': this.froalaMousedown,
      'froalaEditor.contentChanged': (e, editor) => this.updateSectionTitle(e, editor),
      'froalaEditor.initialized': (e, editor) => {
        editor.toolbar.hide();
      },
      'froalaEditor.focus': (e, editor) => {
        editor.toolbar.show();
      },
      'froalaEditor.blur': (e, editor) => {
        editor.toolbar.hide();
      }
    }),
    placeholderText: 'Untitled section',
    multiLine: false,
    editorClass: 'section-title-editor',
    toolbarButtons: [
      'fontFamily',
      'bold',
      'italic',
      'underline'
    ],
    toolbarContainer: '#toolbarContainer'
  };
  @ViewChild('projectEditor') projectEditor: ElementRef;
  @ViewChild('sidebar') sidebar;
  constructor(
    private store: Store < AppState > ,
    private route: ActivatedRoute,
    private segment: SegmentService,
    private ngZone: NgZone
  ) {
    this.getProjectState = this.store.select(selectProjectState);
  }

  toggleFullScr(): void {
    this.sidebarActive = false;
    this.editorFull = !this.editorFull;
    this.board = undefined;
  }

  exportProject(format): void {

    this.exportFormat = format;
    this.exporting = true;
  }

  onSubmit(): void {
  }

  toggleSidebar(): void {
    this.sidebarActive = this.board ? false : !this.sidebarActive;
    this.board = undefined;
    this.segment.track('Toggle sidebar', {
      environment: environment.NAME,
      userId: localStorage.getItem('userId'),
      projectId: this.projectId
    });
  }

  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }
  getSectionText(html): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    return div.innerText.replace(/\s/g, '');
  }
  ngOnInit(): void {
    this.segment.identify(localStorage.getItem('userId'), {
      environment: environment.NAME,
      userId: localStorage.getItem('userId'),
    });
    this.projectloader = true;
    this.route.params.subscribe(params => {
      this.projectId = params.projectId;
    });
    this.segment.page('Project editor', {
      environment: environment.NAME,
      userId: localStorage.getItem('userId'),
      projectId: this.projectId
    });
    if (this.projectId && !this.project) {
      this.store.dispatch(new Init({
        uuid: this.projectId
      }));
    }

    this.projectSubscription = this.getProjectState.subscribe(state => {
      if (state.project) {
        if (this.workingOn === 'project') {
          if (!this.project) this.project = state.project;
        } else {
          const sectionIndex = _.findIndex(state.project.sections || undefined, ['uuid', this.section.uuid || undefined]);
          if (!this.section) this.section = state.project.sections[sectionIndex];
        }
        this.projectloader = false;
      }
      this.active = this.sidebar.active;
      if (!state.error && state.updated) {
        this.ngZone.run(() => {
          this.updated = true;
        });
        setTimeout(() => {
          this.ngZone.run(() => {
            this.updated = false;
          });
        }, 2000);
      }
      this.editingProject = false;
    });

  }
  trackByFn(index, section): any {
    return section.uuid;
  }
  onSectionClick(e): void {
    this.workingOn = 'section';
    const sectionIndex = _.findIndex(this.project.sections, ['uuid', e.section.uuid]);
    this.section = e.section;
    this.sectionOpened = e.opened;
    this.board = undefined;

    /* Save selected section id */
    this.selectedSectionId = e.section.uuid;

    if (e.element && e.element.target && e.element.target.children[1]) {
      e.element.target.children[1].select();
    }
    if (e.newSection) {
      setTimeout(() => {
        if (document.getElementById('project-tree')) {
          const element = document.getElementById('project-tree').childNodes[document.getElementById('project-tree').childNodes.length - 2] as HTMLElement;
          element.getElementsByTagName('input')[0].focus();
        }
      }, 500);

    }
  }

  onProjectClick(e): void {
    this.workingOn = 'project';

    /* Update project from individual section */
    if (this.selectedSectionId) {
      const sectionIndex = _.findIndex(this.project.sections, ['uuid', this.selectedSectionId]);
      this.project.sections[sectionIndex] = this.section;
      this.selectedSectionId = undefined;
    }
  }
  updateSection(e, editor): any {
    if (this.workingOn === 'section') {
      this.store.dispatch(new UpdateSectionText({
        projectId: this.projectId,
        sectionId: this.section.uuid,
        text: editor.el.innerHTML,
        sectionOpen: this.sectionOpened
      }));
    }
  }
  updateSectionById(e, editor): any {
    var sectionId = this.workingOn === 'section' ? this.section.uuid : e.target.id;
    
    this.store.dispatch(new UpdateSectionText({
      projectId: this.projectId,
      sectionId: sectionId,
      text: editor.el.innerHTML,
      sectionOpen: this.sectionOpened
    }));
  }
  updateSectionTitle(e, editor): void {
    this.store.dispatch(new UpdateSectionTitle({
      projectId: this.projectId,
      sectionId: e.target.id,
      value: editor.el.innerHTML,
      sectionOpen: this.sectionOpened
    }));
  }
  updateProjectTitle(e, editor): void {
    this.store.dispatch(new UpdateProjectTitle({
      projectId: this.projectId,
      value: editor.el.innerHTML
    }));
  }
  updateProjectContent(e, editor): any {
    this.editingProject = true;
    this.store.dispatch(new UpdateProjectContent({
      projectId: this.project.uuid,
      content: editor.el.innerHTML
    }));
  }
  boardClick(e): void {
    this.board = e.board;
    this.sidebarActive = true;
  }
  saveExportedFile(): void {
    const url = window.URL.createObjectURL(this.exportedFile);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = `${(this.project.title ? this.project.title : 'project')}.${this.exportFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.exporting = false;
    this.projectExportOptions = false;
    this.exportFormat = '';
  }

  froalaImageError(_e, editor, error, response): void {
    if (error.code === 3) { alert('Image too big. Max size is 10MB'); }
  }

  froalaImageUploaded(_e, editor, response): any {
    const imageUrl = JSON.parse(response).link;

    return true;
  }

  froalaMousedown(e, event): any {
    e.preventDefault();
  }
}
