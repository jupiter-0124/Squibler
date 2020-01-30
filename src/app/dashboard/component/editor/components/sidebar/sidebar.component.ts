import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import _ from 'lodash';
import {
  AppState,
  selectProjectState,
  selectSectionState
} from '../../../../../store/app.states';

import {
  // GetVersion,
  // UpdateVersion,
  // DeleteVersion,
  CloseBoards,
  Init,
  ProjectAddBoard,
  ProjectExport,
  SectionAddBoard,
  UpdateProjectBoardName,
  UpdateProjectSummary,
  UpdateSectionBoardName,
  UpdateSectionSummary,
  VersionAdd,
  VersionDelete,
  VersionUpdate
} from '../../../../../store/actions/project.actions';

@Component({
  selector: 'editor-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() active;
  @Output() onToggle = new EventEmitter();
  @Output() onSectionClick = new EventEmitter();
  @Output() onProjectClick = new EventEmitter();
  @Output() onBoardClick = new EventEmitter();

  selectedSectionId = '';
  selectedBoardId = '';
  projectExportOptions = false;
  exporting = false;
  exportReady = false;
  summaryPopup = false;
  versionAllert = false;
  openedTitle: string;
  boardOpen;
  exportFormat = '';
  workingOn = 'project';
  summaryloading = false;
  summary: string;
  boards: Array < any > ;
  projectDetails = false;
  project;
  board;
  file;
  firstLoad = true;
  selectedNote: any;
  newSectionFlag = false;
  versionList;
  subject = new Subject < string > ();
  sectionOpened = false;
  section;
  sectionSubscription: Subscription;
  projectSubscription: Subscription;
  getSectionState: Observable < any > ;
  getProjectState: Observable < any > ;
  constructor(
    private store: Store < AppState > ,
    private router: Router
  ) {
    this.getSectionState = this.store.select(selectSectionState);
    this.getProjectState = this.store.select(selectProjectState);
    this.subject.pipe(debounceTime(500))
      .subscribe(() => {
        this.saveSummary();
      });
  }

  sectionClick(e): void {
    if (this.active) this.toggleSidebar();
    this.section = e.section;
    this.summary = e.section.summary;
    this.boards = e.section.boards;
    this.openedTitle = e.section.title;
    this.sectionOpened = e.opened;
    this.workingOn = 'section';
    this.selectedSectionId = e.section.uuid;
    this.selectedBoardId = '';
    this.onSectionClick.emit(e);
    this.store.dispatch(new CloseBoards({}));

  }

  detailsClickOutside(event: any): void {
    if (event.target && event.target.localName === 'input') {
      event.target.select();
    }
    if (event && event['value'] === true) {
      this.projectDetails = false;
    }
  }
  openSummary(): void {
    this.selectedBoardId = '';
    if (!this.active) this.toggleSidebar();
  }
  toggleSidebar(): void {
    this.onToggle.emit();
  }
  saveExportedFile(): void {
    const url = window.URL.createObjectURL(this.file);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = `${this.project.title ? this.project.title : 'project'}.${this.exportFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.exporting = false;
    this.projectExportOptions = false;
    this.exportFormat = '';
  }

  addNewVersion(): void {
    if (this.versionList.length === 4) {
      this.versionAllert = true;
      setTimeout(() => {
        this.versionAllert = false;
      }, 2000);
    }
    this.store.dispatch(new VersionAdd(this.project));
  }

  deleteVersion(version): void {
    this.versionList.splice(this.versionList.indexOf(version), 1);
    this.store.dispatch(new VersionDelete(version));
  }

  saveSummary(): void {
    this.store.dispatch(this.workingOn === 'project' ? new UpdateProjectSummary({
      projectId: this.project.uuid,
      text: this.summary
    }) : new UpdateSectionSummary({
      projectId: this.project.uuid,
      sectionId: this.selectedSectionId,
      text: this.summary,
      sectionOpen: this.sectionOpened
    }));
  }

  exportProject(format): void {
    this.exportFormat = format;
    this.exporting = true;
    this.store.dispatch(new ProjectExport({ id: this.project.uuid, format }));
  }
  onSummaryKeyUp(): void {
    this.subject.next();
  }
  addBoard(): void {
    this.store.dispatch(this.workingOn === 'project' ? new ProjectAddBoard({
      projectId: this.project.uuid
    }) : new SectionAddBoard({
      projectId: this.project.uuid,
      sectionId: this.selectedSectionId,
      sectionOpen: this.sectionOpened
    }));
  }
  redirectVersion(version): void {
    this.router.navigateByUrl(`/dashboard/projects/${version.uuid}`);
    this.store.dispatch(new Init({ uuid: version.uuid }));
  }
  updateBoardName(e): void {
    this.store.dispatch(this.workingOn === 'project' ? new UpdateProjectBoardName({
      projectId: this.project.uuid,
      boardId: e.boardId,
      name: e.name,
      boardOpen: e.opened
    }) : new UpdateSectionBoardName({
      projectId: this.project.uuid,
      sectionId: this.selectedSectionId,
      boardId: e.boardId,
      sectionOpen: this.sectionOpened,
      boardOpen: e.opened,
      name: e.name
    }));
  }
  boardDelete(e): void {
    this.selectedBoardId = '';
    if (e.target === 'section')
      this.onSectionClick.emit({ section: this.section, opened: this.sectionOpened });
    else
      this.onProjectClick.emit(this.project);
  }
  addNewSection(): void {
    this.newSectionFlag = true;
  }

  ngOnInit(): void {
    this.projectSubscription = this.getProjectState.subscribe(state => {
      if (state.addVersion) {
        const redirectUuid = state.project.related[state.project.related.length - 1].uuid;
        this.router.navigateByUrl(`/dashboard/projects/${redirectUuid}`);
        this.store.dispatch(new Init({ uuid: redirectUuid }));
      }

      if (state.project && !state.addVersion) {
        this.project = state.project;
        this.versionList = state.project.related;
        if (!this.selectedSectionId) {
          this.summary = this.summary || this.project.summary;
          this.boards = this.project.boards;
          this.openedTitle = this.project.title;
          this.workingOn = 'project';
          if (state.newBoard) {
            localStorage.setItem('newBoard', '');

            this.boardClick({ board: state.project.boards[state.project.boards.length - 1] });

          }
          if (this.selectedBoardId) {
            const boardIndex = _.findIndex(state.project.boards, ['uuid', this.selectedBoardId]);
            this.board = state.project.boards[boardIndex];
          }
        } else {
          const sectionIndex = _.findIndex(state.project.sections, ['uuid', this.selectedSectionId]);
          this.openedTitle = state.project.sections[sectionIndex].title;
          this.boards = state.project.sections[sectionIndex].boards || [];
          if (state.newBoard) {
            localStorage.setItem('newBoard', '');
            this.boardClick({ board: state.project.sections[sectionIndex].boards[state.project.sections[sectionIndex].boards.length - 1] });
          }
          if (this.selectedBoardId) {
            const boardIndex = _.findIndex(state.project.sections[sectionIndex].boards, ['uuid', this.selectedBoardId]);
            this.board = state.project.sections[sectionIndex].boards[boardIndex];
          }
        }
      }
      if (state.file) {
        this.file = state.file;
        this.exportReady = true;
      }
      if (this.newSectionFlag && state.updated) {
        this.section = state.project.sections[state.project.sections.length - 1];
        this.sectionOpened = true;
        const newSectionData = {
          section: {
            boards: [],
            subSections: [],
            summary: '',
            text: '',
            title: '',
            uuid: this.section ? this.section.uuid : ''
          },
          opened: false,
          newSection: true
        };

        this.sectionClick(newSectionData);
        this.newSectionFlag = false;
      }
    });

    this.sectionSubscription = this.getSectionState.subscribe(state => {});

  }
  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
    this.sectionSubscription.unsubscribe();
  }
  boardClick(e): void {
    if (this.active) this.toggleSidebar();
    this.selectedNote = e.note;
    this.selectedBoardId = e.board.uuid;
    this.boardOpen = e.boardOpen;
    this.board = e.board;
    this.active = true;
    this.onBoardClick.emit({ board: e.board });
  }

  projectClick(): void {
    if (this.active) this.toggleSidebar();
    this.section = undefined;
    this.sectionOpened = false;
    this.onProjectClick.emit(this.project);
    this.summary = this.project.summary;
    this.boards = this.project.boards;
    this.openedTitle = this.project.title;
    this.workingOn = 'project';
    this.selectedSectionId = '';
    this.selectedBoardId = '';
    this.store.dispatch(new CloseBoards({}));
  }
  extractContent(s): string {
    const span = document.createElement('span');
    span.innerHTML = s;

    return span.textContent || span.innerText;
  }
}
