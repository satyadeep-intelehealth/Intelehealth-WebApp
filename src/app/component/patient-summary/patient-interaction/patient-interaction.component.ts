import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute } from '@angular/router';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-patient-interaction',
  templateUrl: './patient-interaction.component.html',
  styleUrls: ['./patient-interaction.component.css'],
  animations: [
    trigger('moveInLeft', [
       transition('void=> *', [style({transform: 'translateX(300px)'}),
         animate(200, keyframes ([
          style({transform: 'translateX(300px)'}),
          style({transform: 'translateX(0)'})
           ]))]),
    transition('*=>void', [style({transform: 'translateX(0px)'}),
         animate(100, keyframes([
          style({transform: 'translateX(0px)'}),
          style({transform: 'translateX(300px)'})
        ]))])
     ])
 ]
})
export class PatientInteractionComponent implements OnInit {
msg: any = [];

  interaction = new FormGroup ({
    interaction: new FormControl('', [Validators.required])
  });
  constructor(private service: VisitService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const visitId = this.route.snapshot.params['visit_id'];
    this.service.getAttribute(visitId)
    .subscribe(response => {
      const result = response.results;
      if (result.length !== 0) {
        this.msg.push(result[0].value);
      }
    });
  }

  submit() {
    const visitId = this.route.snapshot.params['visit_id'];
    const formValue = this.interaction.value;
    const value = formValue.interaction;
    this.service.getAttribute(visitId)
    .subscribe(response => {
      const result = response.results;
      if (result.length !== 0) {
      } else {
        const json = {
          'attributeType': '6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc',
          'value': value
          };
        this.service.postAttriute(visitId, json)
        .subscribe(response1 => {
          this.msg.push(response1.value);
        });
      }
    });
  }
}
