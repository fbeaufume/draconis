import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageType} from '../../model/common.model';
import {Message} from '../../model/message.model';
import {MessageItemComponent} from './message-item/message-item.component';

@Component({
    selector: 'app-message',
    imports: [CommonModule, MessageItemComponent],
    templateUrl: './message.component.html'
})
export class MessageComponent {

  // Needed to be able to use the enum type in the template
  messageType: typeof MessageType = MessageType;

  @Input()
  message!: Message;

  constructor() {
  }
}
