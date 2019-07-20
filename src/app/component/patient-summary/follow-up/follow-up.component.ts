import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { DatePipe } from '@angular/common';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { VisitService } from 'src/app/services/visit.service';


@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css'],
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
export class FollowUpComponent implements OnInit {
followUp: any = [];
conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
encounterUuid: string;
patientId: string;
visitUuid: string;
errorText: string;

followForm = new FormGroup({
  date: new FormControl('', [Validators.required]),
  advice: new FormControl('')
});

  constructor(private service: EncounterService,
              private visitService: VisitService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute,
              private datepipe: DatePipe) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.followUp.push(obs);
        }
      });
    });
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, 'dd-MM-yyyy');
    const advice = form.advice;
    if (!obsdate || !advice) {
      this.errorText = 'Please enter text.';
    } else {
      this.visitService.fetchVisitDetails(this.visitUuid)
      .subscribe(visitDetails => {
        visitDetails.encounters.forEach(encounter => {
        if (encounter.display.match('Visit Note') !== null) {
        this.encounterUuid = encounter.uuid;
    const json = {
      concept: this.conceptFollow,
      person: this.patientId,
      obsDatetime: date,
      value: `${obsdate}, Advice: ${advice}`,
      encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        this.followUp.push({value: json.value});
        this.errorText = '';
        Object.keys(this.followForm.controls).forEach(controlName => {
          this.followForm.controls[controlName].reset();
          this.followForm.controls[controlName].setErrors(null);
        });
      });
    }
  });
    });
    }
  }

  delete(i) {
    const uuid = this.followUp[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.followUp.splice(i, 1);
    });
  }

}
