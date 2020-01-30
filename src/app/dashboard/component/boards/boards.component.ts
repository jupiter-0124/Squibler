
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  AppState,
  selectBoardState,
  selectDashboardState,
  selectProjectState
} from '../../../store/app.states';
import {
  AddNote,
  BoardAssighnToBoard,
  BoardCopyToBoard,
  DeleteBoard,
  DeleteNote,
  Init,
  UpdateBoardColor,
  UpdateBoardIcon,
  UpdateBoardName,
  UpdateNoteText,
  UpdateNoteTitle
} from '../../../store/actions/board.actions';
import {
  DeleteProjectBoard,
  DeleteSectionBoard,
  ProjectAddBoard,
  ProjectBoardAddNote,
  ProjectBoardDeleteNote,
  ProjectUpdateNoteText,
  ProjectUpdateNoteTitle,
  SectionAddBoard,
  SectionBoardAddNote,
  SectionBoardDeleteNote,
  SectionUpdateNoteText,
  SectionUpdateNoteTitle,
  UpdateProjectBoardColor,
  UpdateProjectBoardIcon,
  UpdateProjectBoardName,
  UpdateSectionBoardColor,
  UpdateSectionBoardIcon,
  UpdateSectionBoardName
} from '../../../store/actions/project.actions';
import {
  AddBoard,
  Init as InitDashboard
} from '../../../store/actions/dashboard.actions';
import _ from 'lodash';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})

export class BoardsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input()
  board: any;
  @Input()
  sectionId: string;
  @Input()
  projectId: string;
  @Input()
  boardOpen: boolean;
  @Input()
  sectionOpen: boolean;
  @Input()
  selectedNote: any;
  @ViewChild('noteTitle') rightTitleInput;
  @ViewChild('boardName') boardName;

  @Output() onBoardDelete = new EventEmitter();

  note;
  boardId = '';
  getBoardState: Observable<any>;
  getProjectState: Observable<any>;
  iconPopup = false;
  getDashboardState: Observable<any>;
  currentIdea: any;
  updated = false;
  popupStatus: any;
  noteOfCopyBoard: any;
  routeSubscription: any;
  popupCurrentProject: any;
  popupCurrentProjectVisible = false;
  popupCurrentSectionVisible = false;
  addNewBoardFlag = false;
  projectList = [];
  popupCurrentSection: any = [];
  boardList = [];
  noteTitle: any;
  addNewNoteFlag = false;
  openedIdeaControlPopupVar = false;
  openedProjectPopupVar = false;
  firstTimeLoad = true;
  updating = false;
  noclick = false;
  deleteBoardPopup = false;
  searchActive = false;
  optionsPopup = false;
  iconTooltip = false;
  searchText = '';
  dashboardSubscription: any;
  boardSubscription: any;
  projectSubscription: any;
  currentSelectedNote: any;
  newNote = false;
  loader: boolean;
  editorContent = '';
  options = {
    key: 'JA3B4A5A1qB1F1A4C3I1A15A10D3C6E5djknuC-21rzrD3kl==',
    content: 'qwertytim',
    placeholderText: 'Start your thoughts here ... ',
    imageUploadURL: `${environment.backUrlImage}/upload`,
    events: {
      'froalaEditor.contentChanged': (e, editor) => this.updateIdea(editor),
      'froalaEditor.image.uploaded': (e, editor) => this.updateIdea(editor),
      'froalaEditor.image.error': (e, editor, error, response) => {
        if (error.code === 3) alert('Image too big. Max size is 10MB');
      }
    },
    requestHeaders: {
      Authorization: `JWT ${localStorage.token}`
    },
    toolbarButtons: ['insertImage', 'insertLink'],
    tooltips: false,
    charCounterCount: false,
    paragraphFormatSelection: true,
    fontFamilySelection: true,
    fontSizeSelection: true,
    quickInsertButtons: []
  };

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef,
    private ngZone: NgZone
  ) {
    this.getBoardState = this.store.select(selectBoardState);
    this.getProjectState = this.store.select(selectProjectState);
    this.getDashboardState = this.store.select(selectDashboardState);

  }

  @HostListener('document:click', ['$event'])
  clickout(event): void {
    if (this.el.nativeElement.contains(event.target)) {
      if (event.target.className !== 'ideas__editor-dropdown-item') this.optionsPopup = false;
      if (event.target.className !== 'custom-title__block' && event.target.className !== 'board-color' && event.target.id !== 'emoji') this.iconPopup = false;
    }
    if (
      event.target.className !== 'ideas__editor-dropdown-item' &&
      event.target.className !== 'ideas__editor-dropdown'
    ) {
      this.openedProjectPopupVar = false;
      this.openedIdeaControlPopupVar = false;
      this.popupCurrentProjectVisible = false;
      this.popupCurrentSectionVisible = false;
    }
    if (!this.noclick)
      this.iconTooltip = false;
    this.noclick = false;
  }

  insertFroalaArea(item): void {
    this.currentIdea = item;
    'inserted froala';
    this.editorContent = item.description;
  }

  checkElement(idea): any {
    const doc = new DOMParser().parseFromString(idea.text, 'text/html');

    const imagesArray = [];
    Array.from(doc.body.children)
      .forEach(element => {
        Array.from(element.children)
          .forEach(childrenTag => {
            if (childrenTag.tagName === 'IMG')
              imagesArray.push(childrenTag['src']);
          });
      });

    return imagesArray;
  }
  noteClick(note): void {
    this.note = note;
    this.editorContent = note.text;
  }
  toggleOptions(): void {
    this.optionsPopup = !this.optionsPopup;
  }
  updateIdea(editor): void {
    this.updating = true;
    this.newNote = false;

    if (!this.projectId && !this.sectionId) this.store.dispatch(new UpdateNoteText({
      boardId: this.board.uuid,
      noteId: this.note.uuid,
      text: editor.el.innerHTML
    }));
    if (this.projectId && !this.sectionId) this.store.dispatch(new ProjectUpdateNoteText({
      projectId: this.projectId,
      boardId: this.board.uuid,
      noteId: this.note.uuid,
      boardOpen: this.boardOpen,
      text: editor.el.innerHTML
    }));
    if (this.projectId && this.sectionId) this.store.dispatch(new SectionUpdateNoteText({
      projectId: this.projectId,
      sectionId: this.sectionId,
      boardId: this.board.uuid,
      noteId: this.note.uuid,
      boardOpen: this.boardOpen,
      sectionOpen: this.sectionOpen,
      text: editor.el.innerHTML
    }));
  }
  toggleIcon(): void {
    this.iconPopup = !this.iconPopup;
  }
  addNewNote(): void {
    this.updating = true;
    this.newNote = true;
    if (!this.projectId && !this.sectionId) {
      this.addNewNoteFlag = true;

      this.store.dispatch(new AddNote({ boardId: this.board.uuid, title: '', text: '' }));
    }
    if (this.projectId && !this.sectionId) this.store.dispatch(new ProjectBoardAddNote({
      projectId: this.projectId,
      boardId: this.board.uuid,
      boardOpen: this.boardOpen,
      title: '',
      text: ''
    }));
    if (this.projectId && this.sectionId) this.store.dispatch(new SectionBoardAddNote({
      projectId: this.projectId,
      sectionId: this.sectionId,
      boardId: this.board.uuid,
      sectionOpen: this.sectionOpen,
      boardOpen: this.boardOpen,
      title: '',
      text: ''
    }));

  }

  showDeleteBoardPopup(): void {
    this.deleteBoardPopup = true;
  }
  redirectBoard(): string {
    const currentBoard = this.boardList.filter(index => {
      return index.uuid === this.boardId;
    });
    if (this.boardList.indexOf(currentBoard[0]) === 0 && this.boardList.length === 1) {
      return '/dashboard/projects';
    }
    if (this.boardList.indexOf(currentBoard[0]) === 0 && this.boardList.length !== 1) {
      return `/dashboard/boards/${this.boardList[this.boardList.indexOf(currentBoard[0]) + 1].uuid}`;
    }
    if (this.boardList.indexOf(currentBoard[0]) > 0 && this.boardList.length !== 1) {
      return `/dashboard/boards/${this.boardList[this.boardList.indexOf(currentBoard[0]) - 1].uuid}`;
    }

    // return 'qq';
  }
  ngOnInit(): void {

    this.routeSubscription = this.route.params.subscribe(params => {
      this.firstTimeLoad = true;
   
    });

    if (!this.board) {
      this.loader = true;
      this.route.params.subscribe(params => {
        this.boardId = params['boardId'];
        this.newNote = false;
        this.iconPopup = false;
        this.updating = false;
        this.store.dispatch(new Init({ uuid: this.boardId }));
        this.store.dispatch(new InitDashboard({}));
        if (this.boardName) {
          this.boardName.nativeElement.focus();
        }
      });
      // tslint:disable-next-line:cyclomatic-complexity
      this.boardSubscription = this.getBoardState.subscribe(state => {

        if (state.board && !state.board.boardOutput) this.board = state.board;

        if (state.board && state.board.notes && state.board.notes.length) {
          this.note = this.newNote ? state.board.notes[state.board.notes.length - 1] : this.updating ? this.note : '';
          this.editorContent = this.newNote ? state.board.notes[state.board.notes.length - 1].text : this.updating ? this.editorContent : '';
        }

        if (state.deleted) {
          this.deleteBoardPopup = false;
          this.router.navigateByUrl(this.redirectBoard());
        }
        if (!state.error && state.updated) {
          this.updated = true;
          setTimeout(() => {
            this.updated = false;
          }, 2000);
        }
        if (this.board && this.board.uuid && (this.firstTimeLoad || state.boardInitSuccess)) {
          this.note = this.board.notes[0];
          this.firstTimeLoad = false;
          if (this.board.notes.length) {
            this.editorContent = this.board.notes[0].text;
          }
        }
        if (this.addNewNoteFlag === true) {
          this.addNewNoteFlag = false;
          this.note = [...state.board.notes].pop();
          this.ngZone.run(() => this.note = [...state.board.notes].pop());
          setTimeout(() => {
            this.rightTitleInput.nativeElement.focus();
          }, 1000);
          if (this.note) {
            this.rightTitleInput.nativeElement.value = this.note.title;
          }
        }
        if (state.deleteNote && this.board.notes && this.board.notes.length) {
          this.note = this.board.notes[0];
          this.editorContent = this.board.notes[0].text;
          this.rightTitleInput.nativeElement.value = this.note.title;
        }
        if (state.boardAssighnToBoard) {
          this.board.notes.splice(this.board.notes.indexOf(this.note), 1);
          this.note = this.board.notes[0];
        }
        if (this.board && this.board.notes && this.board.notes.length === 0) {

         
          if (this.rightTitleInput && this.note) {
            this.rightTitleInput.nativeElement.value = this.note.title;
          }

        }
        this.loader = false;
        if (state.boardCopyToBoard) {
          this.note = JSON.parse(this.noteOfCopyBoard);
        }
        this.board.notes = this.board.notes.map(element => {
          element.imageArray = this.checkElement(element);
          return element;
        });

        this.openedIdeaControlPopupVar = false;
       
      });
    } else {
      if (this.board.notes.length) {
        if (this.newNote) {
          this.note = this.board.notes[this.board.notes.length - 1];
          this.editorContent = this.board.notes[0].text;
        } else {
          this.note = this.board.notes[0];
          this.editorContent = this.board.notes[0].text;
        }
      } else {
        this.note = {
          uuid: '',
          title: '',
          text: ''
        };
        this.editorContent = '';
      }
      this.projectSubscription = this.getProjectState.subscribe(state => {
        
        if (state.project) {
          if (this.projectId && this.sectionId) {
            const sectionIndex = _.findIndex(state.project.sections, ['uuid', this.sectionId]);
            const boardIndex = _.findIndex(state.project.sections[sectionIndex].boards, ['uuid', this.board.uuid]);
            this.board = state.project.sections[sectionIndex].boards[boardIndex];
          }
          if (this.projectId && !this.sectionId) {

            const boardIndex = _.findIndex(state.project.boards, ['uuid', this.board.uuid]);
            this.board = state.project.boards[boardIndex];
          }
          if (this.board.notes.length) {

            const noteIndex = _.findIndex(this.board.notes, ['uuid', this.note.uuid]);
            if (this.updating && noteIndex !== -1 && !this.newNote) {
              this.note = this.board.notes[noteIndex];
            } else {
              if (this.rightTitleInput) {
                setTimeout(() => {
                  this.rightTitleInput.nativeElement.focus();
                }, 1000);
              }
              this.note = this.board.notes[this.board.notes.length - 1];
            }
          } else {
            if (this.rightTitleInput && state.newBoard) {
              this.rightTitleInput.nativeElement.focus();
              this.boardName.nativeElement.focus();
            }
            this.note = {
              uuid: '',
              title: '',
              text: ''
            };
            this.editorContent = '';
          }
        }
      });
      this.updating = true;
    }

    this.dashboardSubscription = this.getDashboardState.subscribe(state => {

      if (this.addNewBoardFlag === true) {
        this.addNewBoardFlag = false;
        this.router.navigateByUrl(
          `/dashboard/boards/${state.boards[state.boards.length - 1].uuid}`
        );
      }

      this.projectList = state.projects;
      this.boardList = state.boards;
    });
  }
  ngAfterViewInit(): void {
    this.currentSelectedNote = this.selectedNote;
    if (this.board && this.board.notes.length) this.noteClick(this.selectedNote);
    if (this.boardName) {
      this.boardName.nativeElement.focus();
    }
  }
  ngOnChanges(): void {
    if (this.currentSelectedNote !== this.selectedNote) {
      this.currentSelectedNote = this.selectedNote;
      if (this.board && this.board.notes.length) this.noteClick(this.selectedNote);
    }

    if (this.board.notes.length) {
      if (this.newNote) {
        this.note = this.board.notes[this.board.notes.length - 1];
        this.editorContent = this.note.text;
      }
      if (this.board.notes.indexOf(this.note) === -1) {
        this.note = this.board.notes[0];
        this.editorContent = this.board.notes[0].text;
      }
    } else {
      // this.addNewNote();
      this.note = {
        uuid: '',
        title: '',
        text: ''
      };
      this.editorContent = '';
    }
  }
  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
    if (this.boardSubscription) this.boardSubscription.unsubscribe();
    if (this.projectSubscription) this.projectSubscription.unsubscribe();
    if (this.dashboardSubscription) this.dashboardSubscription.unsubscribe();
  }
  updateBoardName(name): void {
    this.updating = true;
    this.newNote = false;
    if (localStorage.getItem('newBoard') === '') {
      this.iconTooltip = true;
      localStorage.removeItem('newBoard');
    }
    if (!this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateBoardName({ boardId: this.board.uuid, value: name }));
    if (this.projectId && this.sectionId)
      this.store.dispatch(new UpdateSectionBoardName({
        projectId: this.projectId,
        sectionId: this.sectionId,
        boardId: this.board.uuid,
        sectionOpen: this.sectionOpen,
        boardOpen: this.boardOpen,
        name
      }));
    if (this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateProjectBoardName({
        projectId: this.projectId,
        boardId: this.board.uuid,
        boardOpen: this.boardOpen,
        name
      }));
  }
  deleteBoard(): void {
    if (!this.projectId && !this.sectionId)
      this.store.dispatch(new DeleteBoard({ boardId: this.board.uuid }));
    if (this.projectId && this.sectionId) {
      this.store.dispatch(new DeleteSectionBoard({
        projectId: this.projectId,
        sectionId: this.sectionId,
        boardId: this.board.uuid,
        sectionOpen: this.sectionOpen
      }));
      this.onBoardDelete.emit({ target: 'section' });
    }
    if (this.projectId && !this.sectionId) {
      this.store.dispatch(new DeleteProjectBoard({
        projectId: this.projectId,
        boardId: this.board.uuid
      }));
      this.onBoardDelete.emit({ target: 'project' });
    }
  }
  updateBoardColor(e): void {
    this.iconPopup = false;
    if (!this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateBoardColor({
        boardId: this.board.uuid,
        color: e.color
      }));
    if (this.projectId && this.sectionId)
      this.store.dispatch(new UpdateSectionBoardColor({
        projectId: this.projectId,
        sectionId: this.sectionId,
        boardId: this.board.uuid,
        sectionOpen: this.sectionOpen,
        boardOpen: this.boardOpen,
        color: e.color
      }));
    if (this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateProjectBoardColor({
        projectId: this.projectId,
        boardId: this.board.uuid,
        boardOpen: this.boardOpen,
        color: e.color
      }));
  }
  updateBoardIcon(e): void {
    this.iconPopup = false;
    if (!this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateBoardIcon({
        boardId: this.board.uuid,
        icon: e.icon
      }));
    if (this.projectId && this.sectionId)
      this.store.dispatch(new UpdateSectionBoardIcon({
        projectId: this.projectId,
        sectionId: this.sectionId,
        boardId: this.board.uuid,
        sectionOpen: this.sectionOpen,
        boardOpen: this.boardOpen,
        icon: e.icon
      }));
    if (this.projectId && !this.sectionId)
      this.store.dispatch(new UpdateProjectBoardIcon({
        projectId: this.projectId,
        boardId: this.board.uuid,
        boardOpen: this.boardOpen,
        icon: e.icon
      }));
  }
  updateNoteTitle(title): void {
    this.updating = true;
    this.newNote = false;
    if (!this.projectId && !this.sectionId) this.store.dispatch(new UpdateNoteTitle({
      boardId: this.board.uuid,
      noteId: this.note ? this.note.uuid : undefined,
      value: title
    }));
    if (this.projectId && !this.sectionId) this.store.dispatch(new ProjectUpdateNoteTitle({
      projectId: this.projectId,
      boardId: this.board.uuid,
      noteId: this.note.uuid,
      boardOpen: this.boardOpen,
      title
    }));
    if (this.projectId && this.sectionId) this.store.dispatch(new SectionUpdateNoteTitle({
      projectId: this.projectId,
      sectionId: this.sectionId,
      boardId: this.board.uuid,
      noteId: this.note.uuid,
      boardOpen: this.boardOpen,
      sectionOpen: this.sectionOpen,
      title
    }));
  }
  duplicateNote(e, note): void {
    e.stopPropagation();
    this.newNote = true;
    this.updating = true;
    if (!this.projectId && !this.sectionId) this.store.dispatch(new AddNote({
      boardId: this.board.uuid,
      title: note.title,
      text: note.text
    }));
    if (this.projectId && !this.sectionId) this.store.dispatch(new ProjectBoardAddNote({
      projectId: this.projectId,
      boardId: this.board.uuid,
      boardOpen: this.boardOpen,
      title: note.title,
      text: note.text
    }));
    if (this.projectId && this.sectionId) this.store.dispatch(new SectionBoardAddNote({
      projectId: this.projectId,
      sectionId: this.sectionId,
      boardId: this.board.uuid,
      boardOpen: this.boardOpen,
      sectionOpen: this.sectionOpen,
      title: note.title,
      text: note.text
    }));
  }
  deleteNote(e, note): void {
    e.stopPropagation();
    this.newNote = false;
    if (!this.projectId && !this.sectionId) {
      this.updating = false;
      this.store.dispatch(new DeleteNote({
        noteId: note.uuid
      }));
    }
    if (this.projectId && !this.sectionId) {
      this.updating = true;
      this.store.dispatch(new ProjectBoardDeleteNote({
        boardId: this.board.uuid,
        noteId: note.uuid,
        boardOpen: this.boardOpen
      }));
    }
    if (this.projectId && this.sectionId) {
      this.updating = true;
      this.store.dispatch(new SectionBoardDeleteNote({
        sectionId: this.sectionId,
        boardId: this.board.uuid,
        noteId: note.uuid,
        boardOpen: this.boardOpen,
        sectionOpen: this.sectionOpen
      }));
    }
  }
  detailsClickOutside(event): void {
    if (event.target && event.target.localName === 'input')
      event.target.select();
  }
  spliceCurrentNote(): void {
    this.board.notes.splice(this.board.notes.indexOf(this.note), 1);
    this.note = this.board.notes[0];

    this.editorContent = this.board.notes[0] ? this.board.notes[0].text : '';
    this.rightTitleInput.nativeElement.value = this.note ? this.note.title : '';
  }

  // popup section

  addNewBoard(): void {
    this.addNewBoardFlag = true;
    this.store.dispatch(new AddBoard('AddNewBoard'));
  }

  openedIdeaControlPopup(): void {
    this.openedIdeaControlPopupVar = !this.openedIdeaControlPopupVar;
    if (
      this.popupCurrentSectionVisible === true ||
      this.popupCurrentProjectVisible === true
    ) {
      this.openedIdeaControlPopupVar = false;
    }
  }

  openedProjectPopup(status): void {
    this.popupStatus = status;
    this.openedProjectPopupVar = !this.openedProjectPopupVar;
  }

  copyText(): void {
    const container = document.createElement('div');
    container.innerHTML = document.getElementsByClassName('fr-element fr-view')[0].innerHTML;
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style['opacity'] = '0';
    const activeSheets = Array.prototype.slice.call(document.styleSheets)
      .filter(sheet => {
        return !sheet.disabled;
      });
    document.body.appendChild(container);
    window.getSelection()
      .removeAllRanges();
    const range = document.createRange();
    range.selectNode(container);
    window.getSelection()
      .addRange(range);
    document.execCommand('copy');
  }

  addIdeaToProject(project): void {
    this.popupCurrentProject = project;
    this.popupCurrentProjectVisible = true;
    this.openedProjectPopupVar = false;
    this.openedIdeaControlPopupVar = false;
    this.popupCurrentSectionVisible = false;
  }

  addIdeaToSection(section): void {
    this.popupCurrentSection = section;
    this.popupCurrentProjectVisible = false;
    this.openedProjectPopupVar = false;
    this.openedIdeaControlPopupVar = false;
    this.popupCurrentSectionVisible = true;
  }

  addNewProjectRedirect(): void {
    this.router.navigateByUrl('/dashboard/projects');
  }

  addIdeaToBoard(board): void {
    const currentBoard = this.getCurrentBoard();
    const assighnObject = {
      assighnBoard: board,
      ideas: this.note,
      currentBoard: currentBoard[0]
    };
    if (this.popupStatus === 'moveTo') {

      this.store.dispatch(new BoardAssighnToBoard(assighnObject));
      this.spliceCurrentNote();
    }

    if (this.popupStatus === 'copyTo') {
      this.noteOfCopyBoard = JSON.stringify(this.note);
      this.store.dispatch(new BoardCopyToBoard(assighnObject));
    }

    this.openedProjectPopupVar = false;
    this.openedIdeaControlPopupVar = false;
    this.popupCurrentProjectVisible = false;
    this.popupCurrentSectionVisible = false;
    // this.router.navigateByUrl('/dashboard/projects');
  }

  addNewBoardToProject(): void {
    const currentBoard = this.getCurrentBoard();
    const dendObject = {
      projectId: this.popupCurrentProject.uuid,
      name: this.board.name,
      currentBoard: currentBoard[0],
      ideas: this.note,
      copy: this.popupStatus
    };
    if (this.popupStatus === 'moveTo') {
      this.spliceCurrentNote();
    }
    this.store.dispatch(new ProjectAddBoard(dendObject));
  }

  addNewBoardToProjectSection(): void {
    const currentBoard = this.getCurrentBoard();

    const dendObject = {
      projectId: this.popupCurrentProject.uuid,
      sectionId: this.popupCurrentSection.uuid,
      name: this.board.name,
      currentBoard: currentBoard[0],
      ideas: this.note,
      copy: this.popupStatus
    };
    if (this.popupStatus === 'moveTo') {
      this.spliceCurrentNote();
    }
    this.store.dispatch(new SectionAddBoard(dendObject));
    //  this.router.navigateByUrl('/dashboard/projects');
  }

  getCurrentBoard(): any {
    const currentBoard = this.boardList.filter(oneBoard => {
      return oneBoard.uuid === this.board.uuid;
    });
    if (currentBoard.length > 0)
      return currentBoard;
    else
      return [this.board];
  }
}
