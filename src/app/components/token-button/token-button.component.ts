import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-button',
  templateUrl: './token-button.component.html',
  styleUrls: ['./token-button.component.scss']
})
export class TokenButtonComponent implements OnInit {

  @Input() wallet;
  @Input() token;
  @Input() selected;

  constructor () { }

  ngOnInit () {
  }

}
