import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppState,
  selectProjectState
} from '../../../../../../../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import {
  DeleteBoard
} from '../../../../../../../../../store/actions/board.actions';

@Component({
  selector: 'app-board-item',
  templateUrl: './board-item.component.html',
  styleUrls: ['./board-item.component.scss']
})
export class BoardItemComponent implements OnInit, OnDestroy {

  board: any;
  @Input('board')

  set name(board: any) {
    this.board = board;
  }
  @Input()
  active;
  @Output()
  onUpdateBoardName = new EventEmitter();
  @Output()
  onBoardClick = new EventEmitter();
  @Output()
  onBoardDelete = new EventEmitter();
  open = true;
  updating = false;
  projectSubscription: Subscription;
  subscription: Subscription;
  getProjectState: Observable<any>;
  observablePeople: any;
  constructor(
    private store: Store<AppState>
  ) {
    this.getProjectState = this.store.select(selectProjectState);
  }

  toggleItems(e): void {
    e.stopPropagation();
    this.open = !this.open;
  }
  updateBoardName(name): void {
    this.updating = true;
    this.onUpdateBoardName.emit({
      boardId: this.board.uuid,
      name,
      opened: this.open
    });
  }
  deleteBoard(board): void {
    this.store.dispatch(new DeleteBoard({ boardId: board.uuid }));
    this.onBoardDelete.emit({
      board
    });
  }
  ngOnInit(): void {
    this.projectSubscription = this.getProjectState.subscribe(state => {
      if (state.project && this.updating) this.open = state.updatedBoardOpened;
    });
    this.updating = false;
  }
  getInfo() {
  }
  getNoteText(html): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    return div.innerText;
  }
  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }
}
