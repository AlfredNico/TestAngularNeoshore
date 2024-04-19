import { NgPlural } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, toArray } from 'rxjs';
import { Mission } from 'src/app/models/mission';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private missionsSubject: BehaviorSubject<Mission[]> = new BehaviorSubject<Mission[]>([]);
  public missions$: Observable<Mission[]> = this.missionsSubject.asObservable();

  constructor(private http: HttpClient) {

  }

  getMissions(): void {
    this.http.get<Mission[]>('/missions').pipe(
      map((res) => {
        this.missionsSubject.next(res);
      })
    ).subscribe();
  }

  addMission(mission: Mission, action: string): void {

    let missions = this.missionsSubject.getValue();
    if (action == 'add') {
      missions.push({...mission, id: missions.length + 1});
    } else if(action == 'edit') {
      const index = missions.findIndex(x => x.id == mission.id);
      missions[index] = {...mission};
    } else if(action == 'remove') {
      missions = missions.filter(x => x.id != mission.id);
    }
    this.missionsSubject.next(missions);
  }
}
