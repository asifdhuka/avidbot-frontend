import {Component} from '@angular/core';
import {NgForm} from "@angular/forms";
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Subscription, timer} from "rxjs";
import {mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bot';
  TIMEOUT_IN_MS = 200;
  myIntervalSubscription: Subscription | undefined;
  totalEmptySpace = 0
  cleanedSpace = 0
  cleaningDone = false
  coveragePercentage = 0
  currentPosition = "0,0"
  doneMessage = "I am done with cleaning, its time to go back to home"
  newCleanedSpacePerSecond = 0
  totalEmptySpaces = 0
  totalWalls = 0

  constructor(private http: HttpClient) {
  }

  pollBotInformation(): void {
    this.myIntervalSubscription = timer(0, this.TIMEOUT_IN_MS)
      .pipe(mergeMap(_ => this.getData()))
      .subscribe(
        (res: any) => {
          console.log('Result: ', res);
          this.cleanedSpace = res.cleanedSpace
          this.cleaningDone = res.cleaningDone
          this.coveragePercentage = res.coveragePercentage
          this.currentPosition = res.currentPosition
          this.doneMessage = res.doneMessage
          this.newCleanedSpacePerSecond = res.newCleanedSpacePerSecond
          this.totalEmptySpaces = res.totalEmptySpaces
          this.totalWalls = res.totalWalls
          if (this.cleaningDone) {
            // @ts-ignore
            this.myIntervalSubscription.unsubscribe()
          }

        },
        (err: HttpErrorResponse) => {
          console.log('Error:', err);
        }
      );
  }

  submit(form: NgForm) {
    console.log(form.value);
    this.pollBotInformation();
    this.http.post<any>('http://localhost:5000/avidbotsRobot/process', form.value).subscribe({
      next: data => {
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
  }

  getData() {
    return this.http.get<any>(`http://localhost:5000/avidbotsRobot/statistics`);
  }
}

