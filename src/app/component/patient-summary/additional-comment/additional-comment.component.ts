import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from './../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-additional-comment',
  templateUrl: './additional-comment.component.html',
  styleUrls: ['./additional-comment.component.css'],
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
export class AdditionalCommentComponent implements OnInit {
comment: any = [];
encounterUuid: string;
patientId: string;
visitUuid: string;
conceptComment = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  commentForm = new FormGroup ({
    comment: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
              private visitService: VisitService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptComment)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.comment.push(obs);
        }
      });
    });
  }

  Submit() {
    const date = new Date();
    const form = this.commentForm.value;
    const value = form.comment;
    this.visitService.fetchVisitDetails(this.visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(encounter => {
      if (encounter.display.match('Visit Note') !== null) {
      this.encounterUuid = encounter.uuid;
      const json = {
        concept: this.conceptComment,
        person: this.patientId,
        obsDatetime: date,
        value: value,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
      this.comment.push({value: value});
      Object.keys(this.commentForm.controls).forEach(controlName => {
        this.commentForm.controls[controlName].reset();
        this.commentForm.controls[controlName].setErrors(null);
      });
    });
  }
  });
});
}

  delete(i) {
    const uuid = this.comment[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.comment.splice(i, 1);
    });
  }

}
