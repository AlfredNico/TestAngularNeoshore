import { AfterViewInit, Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarOptions, EventInput } from '@fullcalendar/angular';
import { MissionService } from './services/mission/mission.service';
import { Mission } from './models/mission';
import { ChangeDetectorRef } from '@angular/core';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



const TEAMS_LIST = [
  {
    name: 'Team 1', color: '#FF5722', employees: [
      { name: 'employee 1', avatar: 'emp1.jpeg' },
      { name: 'employee 2', avatar: 'emp2.jpeg' },
      { name: 'employee 3', avatar: 'emp3.jpeg' },
    ]
  }, {
    name: 'Team 2', color: '#2196F3', employees: [
      { name: 'employee 4', avatar: 'emp4.jpeg' },
      { name: 'employee 5', avatar: 'emp5.jpeg' },
    ]
  }, {
    name: 'Team 3', color: '#FFC107', employees: [
      { name: 'employee 6', avatar: 'emp6.jpeg' },
      { name: 'employee 7', avatar: 'emp7.jpeg' },
    ]
  }, {
    name: 'Team 4', color: '#795548', employees: [
      { name: 'employee 8', avatar: 'emp8.jpeg' },
    ]
  }
  , {
    name: 'Team 5', color: '#9C27B0', employees: [
      { name: 'employee 10', avatar: 'emp9.jpeg' },
      { name: 'employee 11', avatar: 'emp10.jpeg' },
      { name: 'employee 12', avatar: 'emp11.jpeg' },
      { name: 'employee 13', avatar: 'emp12.jpeg' },
    ]
  }
]


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild("content") modalContent!: TemplateRef<any>;
  missionForm = this.fb.group({
    id: '',
    title: ['', Validators.required],
    description: ['', Validators.required],
    color: ['', Validators.required],
    date: ['', Validators.required]
  });
  modalRef!: any;


  submitted = false;
  calendarOptions!: CalendarOptions;
  teamsList = TEAMS_LIST;

  get title() {
    return this.missionForm.get('title')!;
  }

  get description() {
    return this.missionForm.get('description')!;
  }

  get color() {
    return this.missionForm.get('color')!;
  }

  get date() {
    return this.missionForm.get('date')!;
  }
  get id() {
    return this.missionForm.get('id')!;
  }

  constructor(
    private missionServce: MissionService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modal: NgbModal
    ){ }


  ngOnInit() {
     this.loadMissions();
  }

  eventMouseEnter(info: any) {
    const description = info.event.extendedProps.description;
    if (description) {
      const element = info.el;
      element.setAttribute('data-description', description);
    }
  }

  loadMissions() {
    this.missionServce.getMissions();
    this.missionServce.missions$.subscribe(missions => {
      this.updateCalendarEvents(missions);
    });
  }

  updateCalendarEvents(missions: Mission[]) {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: missions,
      eventMouseEnter: this.eventMouseEnter.bind(this),
      eventDidMount: function(info) {
        const tooltipContent = `<div class="bottom-arrow">${info.event.extendedProps['description']}</div>`;
        const tippyInstance = tippy(info.el, {
            content: tooltipContent,
            trigger: 'mouseenter',
            allowHTML: true,
        });
      }
    };
  }


  addMission() {
    const actionType = (this.id.value == '' || this.id.value == null) ? 'add' : 'edit';
    if (this.missionForm.invalid) {
      return;
    }
    const formData = this.missionForm.value;
    this.missionServce.addMission(formData, actionType);
    this.modalRef.close();
  }

  removeMission() {
    const actionType = 'remove';
    this.missionServce.addMission(this.missionForm.value, actionType);
    this.missionForm.reset();
    this.modalRef.close();
  }


  handleEventClick(arg: any){
    const data = arg.event;
    this.missionForm.patchValue({
      id: data.id,
      title: data.title,
      description: data.extendedProps['description'],
      color: data.borderColor,
      date: data.startStr
    });
    this.modalRef = this.modal.open(this.modalContent, { backdrop : 'static', keyboard : false });
  }

  handleDateClick(date: { dateStr: string; }) {
    this.missionForm.patchValue({
      id: '',
      title: '',
      description: '',
      color: '',
      date: date.dateStr
    });
    this.modalRef = this.modal.open(this.modalContent, { backdrop : 'static', keyboard : false });
  }

}
